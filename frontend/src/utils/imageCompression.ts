import imageCompression from 'browser-image-compression';

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;

export const compressImage = async (file: File): Promise<string> => {
  try {
    const options = {
      maxSizeMB: 0.5, // 500KB
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
      initialQuality: 0.9,
    };

      // Always attempt compression/resize to normalize dimensions and format
      console.log(`Processing image of ${(file.size / 1024).toFixed(2)}KB...`);
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image. Please try with a different image.');
  }
};
