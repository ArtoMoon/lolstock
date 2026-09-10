/**
 * PNG to ICO Converter.
 *
 * Windows Vista+ standardına uygun olarak PNG görselini ICO formatı ile sarmalar.
 *
 * @module scripts/make-ico
 */

const fs = require('fs');
const path = require('path');

const srcPng = path.join(__dirname, '..', 'build', 'icon.png');
const destIco = path.join(__dirname, '..', 'build', 'icon.ico');

function createIcoFromPng() {
  if (!fs.existsSync(srcPng)) {
    console.error('Kaynak PNG bulunamadı:', srcPng);
    return;
  }

  const pngBuffer = fs.readFileSync(srcPng);
  const size = pngBuffer.length;

  // ICO Başlığı (6 byte)
  // 0-1: Reserved (0)
  // 2-3: Image type (1 = ICO)
  // 4-5: Number of images (1)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  // ICONDIRENTRY (16 byte)
  // 0: Width (0 = 256)
  // 1: Height (0 = 256)
  // 2: Color palette (0)
  // 3: Reserved (0)
  // 4-5: Color planes (1)
  // 6-7: Bits per pixel (32)
  // 8-11: Size of image data in bytes
  // 12-15: Offset of image data from beginning of file (6 + 16 = 22)
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(0, 0); // 256px
  dirEntry.writeUInt8(0, 1); // 256px
  dirEntry.writeUInt8(0, 2);
  dirEntry.writeUInt8(0, 3);
  dirEntry.writeUInt16LE(1, 4);
  dirEntry.writeUInt16LE(32, 6);
  dirEntry.writeUInt32LE(size, 8);
  dirEntry.writeUInt32LE(22, 12); // Header (6) + Entry (16)

  const icoBuffer = Buffer.concat([header, dirEntry, pngBuffer]);

  fs.writeFileSync(destIco, icoBuffer);
  console.log('[ICO] Başarıyla oluşturuldu:', destIco, `(${icoBuffer.length} bytes)`);

  // public/ ve electron/assets altına da kopyala
  fs.copyFileSync(destIco, path.join(__dirname, '..', 'public', 'favicon.ico'));
  fs.copyFileSync(destIco, path.join(__dirname, '..', 'electron', 'assets', 'icon.ico'));
}

createIcoFromPng();
