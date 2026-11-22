const { deflateSync, crc32 } = require('zlib');
const { writeFileSync } = require('fs');

const OUT_DIR = './public';

function chunk(type, data) {
  const header = Buffer.alloc(4 + 4 + data.length + 4);
  header.writeInt32BE(data.length, 0);
  header.write(type, 4, 4);
  data.copy(header, 8);
  // crc32 returns unsigned, convert to signed int32
  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])) | 0;
  header.writeInt32BE(crc, 8 + data.length);
  return header;
}

function hexToBytes(hex) {
  const b = [];
  for (let i = 0; i < hex.length; i += 2) {
    b.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return b;
}

function createPNG(width, height, hexBg) {
  const r = hexToBytes(hexBg.substring(1, 3))[0];
  const g = hexToBytes(hexBg.substring(3, 5))[0];
  const b = hexToBytes(hexBg.substring(5, 7))[0];

  const raw = Buffer.alloc(width * height * 3);
  for (let i = 0; i < raw.length; i++) {
    raw[i] = (i % 3 === 0) ? r : (i % 3 === 1) ? g : b;
  }

  const idatData = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) {
    idatData[y * (width * 3 + 1)] = 0;
    raw.copy(idatData, y * (width * 3 + 1) + 1, y * width * 3, y * width * 3 + width * 3);
  }

  const compressed = deflateSync(idatData);

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', Buffer.from([
      (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,
      (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF,
      24, 0, 0, 0, // color type 2 (RGB), bit depth 8
    ])),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const sizes = [
  ['icon-192.png', 192, 192],
  ['icon-512.png', 512, 512],
  ['splash-320.png', 320, 470],
  ['splash-640.png', 640, 960],
  ['splash-768.png', 768, 1024],
  ['splash-1024.png', 1024, 1024],
];

for (const [file, w, h] of sizes) {
  const png = createPNG(w, h, '#0D6EFD');
  writeFileSync(OUT_DIR + '/' + file, png);
  console.log('Created ' + file + ' (' + w + 'x' + h + ') - ' + png.length + ' bytes');
}
console.log('Done generating assets');
