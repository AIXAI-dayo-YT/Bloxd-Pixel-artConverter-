// Logic ported and adapted to TS from the provided bundle.js logic and chat history
// Ensures correct RLE and binary structure for Bloxd.io

export class BloxdWriter {
  private buf: number[] = [];

  // Unsigned VarInt
  varint(v: number): void {
    // Matching bundle.js logic: while (-128 & e)
    while (v & -128) {
      this.buf.push((v & 0x7f) | 0x80);
      v >>>= 7;
    }
    this.buf.push(v);
  }

  // ZigZag encoding for signed integers
  zigzag(n: number): void {
    this.varint((n << 1) ^ (n >> 31));
  }

  // String writing (length prefix + bytes)
  str(s: string): void {
    const encoder = new TextEncoder();
    const b = encoder.encode(s);
    this.zigzag(b.length);
    b.forEach((v) => this.buf.push(v));
  }

  // Byte array writing (length prefix + bytes)
  bytes(b: Uint8Array | number[]): void {
    this.zigzag(b.length);
    for (const v of b) {
      this.buf.push(v);
    }
  }

  // Append raw byte
  u8(v: number): void {
    this.buf.push(v & 255);
  }

  getBlob(): Blob {
    return new Blob([new Uint8Array(this.buf)], { type: "application/octet-stream" });
  }
}

// RLE Compression specifically for Bloxd
// Format: [Count VarInt] [Value VarInt]
export function compressRLE(arr: number[]): Uint8Array {
  const out: number[] = [];
  if (arr.length === 0) return new Uint8Array(out);

  let last = arr[0];
  let cnt = 1;

  const pushRun = (count: number, id: number) => {
    // Write count as VarInt
    let c = count;
    while (c & -128) {
      out.push((c & 0x7f) | 0x80);
      c >>>= 7;
    }
    out.push(c);

    // Write ID as VarInt
    let v = id;
    while (v & -128) {
      out.push((v & 0x7f) | 0x80);
      v >>>= 7;
    }
    out.push(v);
  };

  for (let i = 1; i <= arr.length; i++) {
    const v = i < arr.length ? arr[i] : -1;
    if (v === last) {
      cnt++;
    } else {
      pushRun(cnt, last);
      last = v;
      cnt = 1;
    }
  }
  return new Uint8Array(out);
}