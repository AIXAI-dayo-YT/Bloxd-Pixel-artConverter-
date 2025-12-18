import { BloxdWriter, compressRLE } from './bloxdWriter';
import { PALETTE, CHUNK_SIZE } from '../constants';

export enum Axis {
  Z = "Z", // Wall (Front facing)
  X = "X"  // Floor (Flat)
}

function nearestColorID(r: number, g: number, b: number, a: number): number {
  if (a < 128) return 0; // Transparent = Air
  let best = 0;
  let min = 1e9;
  for (const p of PALETTE) {
    const d = (r - p.rgb[0]) ** 2 + (g - p.rgb[1]) ** 2 + (b - p.rgb[2]) ** 2;
    if (d < min) {
      min = d;
      best = p.id;
    }
  }
  return best;
}

export const generateSchematic = (
  imgData: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  axis: Axis
): Blob => {
  // 1. Prepare 3D Block Data
  const sizeY = imgHeight;
  const depth = 2; // Fixed thickness
  
  let sizeX: number;
  let sizeZ: number;

  if (axis === Axis.Z) {
    sizeX = imgWidth;
    sizeZ = depth;
  } else {
    // Floor mode
    sizeX = depth;
    sizeZ = imgWidth;
  }

  // Initialize 3D array: blocks[y][z][x]
  // Using generic arrays to avoid confusing TypedArray initialization for 3D
  const blocks: number[][][] = Array.from({ length: sizeY }, () =>
    Array.from({ length: sizeZ }, () => new Array(sizeX).fill(0))
  );

  // 2. Map Pixels to Blocks
  for (let y = 0; y < imgHeight; y++) {
    for (let x = 0; x < imgWidth; x++) {
      const i = (y * imgWidth + x) * 4;
      const id = nearestColorID(imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]);
      
      if (!id) continue;

      // Invert Y for schematic (bottom-up)
      const by = sizeY - 1 - y;

      if (axis === Axis.Z) {
        // Wall: Width maps to X, Thickness maps to Z
        blocks[by][0][x] = id;
        blocks[by][1][x] = id;
      } else {
        // Floor: Width maps to Z, Thickness maps to X
        blocks[by][x][0] = id;
        blocks[by][x][1] = id;
      }
    }
  }

  // 3. Setup Writer
  const w = new BloxdWriter();
  
  // Header: Version 4 (Safe for Bloxd)
  w.u8(4); w.u8(0); w.u8(0); w.u8(0);
  
  w.str("FromImage");
  
  // Offsets
  w.zigzag(0); w.zigzag(0); w.zigzag(0);
  
  // Dimensions
  w.zigzag(sizeX); w.zigzag(sizeY); w.zigzag(sizeZ);

  // Chunk Counts
  const CX = Math.ceil(sizeX / CHUNK_SIZE);
  const CY = Math.ceil(sizeY / CHUNK_SIZE);
  const CZ = Math.ceil(sizeZ / CHUNK_SIZE);
  
  w.zigzag(CX * CY * CZ);

  // 4. Chunk Loops
  // FIXED: Loop order must be X -> Y -> Z for chunks
  for (let cx = 0; cx < CX; cx++) {
    for (let cy = 0; cy < CY; cy++) {
        for (let cz = 0; cz < CZ; cz++) {
        
        w.zigzag(cx); w.zigzag(cy); w.zigzag(cz);

        const raw: number[] = [];

        // FIXED: Inner Loop Order: X -> Y -> Z
        // This ensures linear index = x*1024 + y*32 + z
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
          for (let ly = 0; ly < CHUNK_SIZE; ly++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
              
              const gx = cx * CHUNK_SIZE + lx;
              const gy = cy * CHUNK_SIZE + ly;
              const gz = cz * CHUNK_SIZE + lz;

              let id = 0;
              // Boundary check
              if (gx < sizeX && gy < sizeY && gz < sizeZ) {
                // Access blocks[y][z][x]
                id = blocks[gy][gz][gx];
              }
              raw.push(id);
            }
          }
        }

        w.bytes(compressRLE(raw));
      }
    }
  }

  // Footer data
  w.zigzag(0); // Chunks End
  w.zigzag(0); // BlockData
  w.zigzag(0); w.zigzag(0); w.zigzag(0); // Global Pos
  w.u8(0); w.u8(0); // EOF

  return w.getBlob();
};