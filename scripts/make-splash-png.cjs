// Creates a small transparent PNG (used as an invisible native splash logo so
// the Android startup flash shows only the brand background color, while the
// real loading animation (Lottie) is shown by the JS AppSplash screen).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 200, H = 200; // RGBA, all pixels transparent (alpha 0)

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Scanlines: filter byte 0 + W*H*4 RGBA bytes (transparent).
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) raw[y * (1 + W * 4)] = 0; // filter: None

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 6;  // color type RGBA
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.resolve(__dirname, '..', 'artifacts', 'mobile', 'assets', 'images', 'splash-screen.png');
fs.writeFileSync(out, png);
console.log('wrote transparent splash png ->', out, png.length, 'bytes');