export interface BlockPalette {
  id: number;
  rgb: [number, number, number];
  name: string;
}

// Palette based on Wool and Concrete colors compatible with Bloxd
export const PALETTE: BlockPalette[] = [
  // Wool (IDs 51-66)
  { id: 51, rgb: [233, 236, 236], name: 'White Wool' },
  { id: 52, rgb: [240, 118, 19], name: 'Orange Wool' },
  { id: 53, rgb: [189, 68, 179], name: 'Magenta Wool' },
  { id: 54, rgb: [58, 175, 217], name: 'Light Blue Wool' },
  { id: 55, rgb: [248, 197, 39], name: 'Yellow Wool' },
  { id: 56, rgb: [112, 185, 25], name: 'Lime Wool' },
  { id: 57, rgb: [237, 141, 172], name: 'Pink Wool' },
  { id: 58, rgb: [62, 68, 71], name: 'Gray Wool' },
  { id: 59, rgb: [142, 142, 134], name: 'Light Gray Wool' },
  { id: 60, rgb: [21, 137, 145], name: 'Cyan Wool' },
  { id: 61, rgb: [121, 42, 172], name: 'Purple Wool' },
  { id: 62, rgb: [53, 57, 157], name: 'Blue Wool' },
  { id: 63, rgb: [114, 71, 40], name: 'Brown Wool' },
  { id: 64, rgb: [84, 109, 27], name: 'Green Wool' },
  { id: 65, rgb: [160, 39, 34], name: 'Red Wool' },
  { id: 66, rgb: [20, 21, 25], name: 'Black Wool' },
  // Concrete (IDs 84-99 range, mapped specifically)
  { id: 97, rgb: [207, 213, 214], name: 'White Concrete' },
  { id: 93, rgb: [224, 97, 0], name: 'Orange Concrete' },
  { id: 92, rgb: [169, 48, 159], name: 'Magenta Concrete' },
  { id: 90, rgb: [35, 137, 198], name: 'Light Blue Concrete' },
  { id: 99, rgb: [240, 175, 21], name: 'Yellow Concrete' },
  { id: 91, rgb: [94, 169, 24], name: 'Lime Concrete' },
  { id: 94, rgb: [213, 101, 142], name: 'Pink Concrete' },
  { id: 84, rgb: [54, 57, 61], name: 'Gray Concrete' },
  { id: 85, rgb: [125, 125, 115], name: 'Light Gray Concrete' },
  { id: 89, rgb: [21, 119, 136], name: 'Cyan Concrete' },
  { id: 95, rgb: [100, 31, 156], name: 'Purple Concrete' },
  { id: 87, rgb: [44, 46, 143], name: 'Blue Concrete' },
  { id: 88, rgb: [96, 59, 31], name: 'Brown Concrete' },
  { id: 98, rgb: [73, 91, 36], name: 'Green Concrete' },
  { id: 96, rgb: [142, 32, 32], name: 'Red Concrete' },
  { id: 86, rgb: [8, 10, 15], name: 'Black Concrete' }
];

export const CHUNK_SIZE = 32;