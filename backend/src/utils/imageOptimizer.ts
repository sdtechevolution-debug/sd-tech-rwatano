import sharp from 'sharp';
import { Buffer } from 'buffer';

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;

export const optimizeImage = async (buffer: Buffer): Promise<Buffer> => {
  try {
    console.log(`Optimizing image from ${(buffer.length / 1024).toFixed(2)}KB...`);

    const image = sharp(buffer).resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    const metadata = await image.metadata();
    let optimized: Buffer;

    switch (metadata.format) {
      case 'png':
        optimized = await image.png({ compressionLevel: 9, progressive: true }).toBuffer();
        break;
      case 'webp':
        optimized = await image.webp({ quality: 80 }).toBuffer();
        break;
      default:
        optimized = await image.jpeg({ quality: 80, progressive: true }).toBuffer();
        break;
    }

    console.log(`Optimized to ${(optimized.length / 1024).toFixed(2)}KB`);
    return optimized.length < buffer.length ? optimized : buffer;
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw new Error('Failed to optimize image');
  }
};

export const getImageDimensions = async (buffer: Buffer): Promise<{ width: number; height: number }> => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch (error) {
    console.error('Failed to get image dimensions:', error);
    throw new Error('Failed to get image dimensions');
  }
};
