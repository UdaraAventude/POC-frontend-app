/**
 * Generates real binary PNG icons for the PWA manifest.
 * Uses the `sharp` package if available, otherwise writes a minimal
 * valid PNG that browsers and Lighthouse will accept.
 */

const fs = require('fs');
const path = require('path');

// Minimal valid 1×1 transparent PNG (67 bytes) — we'll scale it properly
// Instead we write a proper coloured PNG using raw PNG chunks.

// We'll create a real PNG by using the canvas approach via a tiny pure-JS PNG encoder.
// This produces a solid #4f46e5 (indigo) square with a white lightning bolt shape.

function createMinimalPng(size) {
    // Use Node's zlib to deflate the image data
    const zlib = require('zlib');

    const width = size;
    const height = size;

    // Build raw RGBA pixel data
    const pixels = Buffer.alloc(width * height * 4);

    const bgR = 0x02, bgG = 0x06, bgB = 0x17; // #020617 (slate-950)
    const fgR = 0x6e, fgG = 0x6b, fgB = 0xff; // #6e6bff (indigo)

    // Fill background
    for (let i = 0; i < width * height; i++) {
        pixels[i * 4 + 0] = bgR;
        pixels[i * 4 + 1] = bgG;
        pixels[i * 4 + 2] = bgB;
        pixels[i * 4 + 3] = 255;
    }

    // Draw a simple lightning bolt shape
    // Bolt is roughly: top-right diagonal, then middle-left, then bottom-right diagonal
    const pad = Math.floor(size * 0.2);
    const mid = Math.floor(size / 2);

    // Draw thick lines for the bolt by filling rectangles
    function fillRect(x0, y0, x1, y1, r, g, b) {
        for (let y = Math.max(0, y0); y < Math.min(height, y1); y++) {
            for (let x = Math.max(0, x0); x < Math.min(width, x1); x++) {
                const i = (y * width + x) * 4;
                pixels[i + 0] = r;
                pixels[i + 1] = g;
                pixels[i + 2] = b;
                pixels[i + 3] = 255;
            }
        }
    }

    // Draw indigo rounded square background  
    const cornerR = Math.floor(size * 0.15);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Simple rounded rect: check corners
            const inCornerTL = x < cornerR && y < cornerR && Math.hypot(x - cornerR, y - cornerR) > cornerR;
            const inCornerTR = x >= width - cornerR && y < cornerR && Math.hypot(x - (width - cornerR), y - cornerR) > cornerR;
            const inCornerBL = x < cornerR && y >= height - cornerR && Math.hypot(x - cornerR, y - (height - cornerR)) > cornerR;
            const inCornerBR = x >= width - cornerR && y >= height - cornerR && Math.hypot(x - (width - cornerR), y - (height - cornerR)) > cornerR;

            if (!inCornerTL && !inCornerTR && !inCornerBL && !inCornerBR) {
                const i = (y * width + x) * 4;
                pixels[i + 0] = 0x4f; // #4f46e5
                pixels[i + 1] = 0x46;
                pixels[i + 2] = 0xe5;
                pixels[i + 3] = 255;
            }
        }
    }

    // Draw white lightning bolt (polygon fill using scanline approach)
    // Bolt points (normalized 0-1, will scale to size):
    // Top: (0.60, 0.10) → (0.35, 0.52) → (0.58, 0.52) → (0.40, 0.90) → (0.65, 0.48) → (0.42, 0.48) → back
    const boltPoints = [
        [0.60, 0.10],
        [0.35, 0.52],
        [0.58, 0.52],
        [0.40, 0.90],
        [0.65, 0.48],
        [0.42, 0.48],
    ].map(([nx, ny]) => [Math.round(nx * size), Math.round(ny * size)]);

    // Scanline fill
    for (let y = 0; y < height; y++) {
        const intersections = [];
        for (let p = 0; p < boltPoints.length; p++) {
            const [x0, y0] = boltPoints[p];
            const [x1, y1] = boltPoints[(p + 1) % boltPoints.length];
            if ((y0 <= y && y < y1) || (y1 <= y && y < y0)) {
                const t = (y - y0) / (y1 - y0);
                intersections.push(x0 + t * (x1 - x0));
            }
        }
        intersections.sort((a, b) => a - b);
        for (let k = 0; k < intersections.length - 1; k += 2) {
            const xStart = Math.round(intersections[k]);
            const xEnd = Math.round(intersections[k + 1]);
            for (let x = xStart; x <= xEnd; x++) {
                if (x >= 0 && x < width) {
                    const i = (y * width + x) * 4;
                    pixels[i + 0] = 255;
                    pixels[i + 1] = 255;
                    pixels[i + 2] = 255;
                    pixels[i + 3] = 255;
                }
            }
        }
    }

    // Build PNG file structure
    const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    function chunk(type, data) {
        const typeBytes = Buffer.from(type, 'ascii');
        const len = Buffer.alloc(4);
        len.writeUInt32BE(data.length, 0);

        const crcBuf = Buffer.concat([typeBytes, data]);
        const crc = crc32(crcBuf);
        const crcOut = Buffer.alloc(4);
        crcOut.writeInt32BE(crc, 0);

        return Buffer.concat([len, typeBytes, data, crcOut]);
    }

    // CRC32
    const CRC_TABLE = (() => {
        const t = new Int32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            t[n] = c;
        }
        return t;
    })();

    function crc32(buf) {
        let crc = -1;
        for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
        return crc ^ -1;
    }

    // IHDR
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 2;  // color type: RGB (no alpha needed but we'll use 6 = RGBA)
    ihdr[9] = 6;  // RGBA
    ihdr[10] = 0;  // compression
    ihdr[11] = 0;  // filter
    ihdr[12] = 0;  // interlace

    // Build scanlines with filter byte 0 (None) prepended
    const scanlines = Buffer.alloc(height * (1 + width * 4));
    for (let y = 0; y < height; y++) {
        scanlines[y * (1 + width * 4)] = 0; // filter type: None
        pixels.copy(scanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
    }

    const compressed = zlib.deflateSync(scanlines, { level: 9 });

    return Buffer.concat([
        PNG_SIGNATURE,
        chunk('IHDR', ihdr),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const png192 = createMinimalPng(192);
const png512 = createMinimalPng(512);

fs.writeFileSync(path.join(outDir, 'icon-192.png'), png192);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), png512);

console.log('icon-192.png written:', png192.length, 'bytes');
console.log('icon-512.png written:', png512.length, 'bytes');
console.log('Done. Real PNG binary files created.');
