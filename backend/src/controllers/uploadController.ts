import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import cloudinary from "../utils/cloudinary";
import { logActivity } from "../utils/activity";
import { optimizeImage } from "../utils/imageOptimizer";

export const uploadProductImage = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Optimize image before upload
    const optimizedBuffer = await optimizeImage(file.buffer);
    console.log(`Original size: ${(file.buffer.length / 1024).toFixed(2)}KB, Optimized size: ${(optimizedBuffer.length / 1024).toFixed(2)}KB`);

    const streamUpload = (buffer: Buffer) => {
    return new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ 
          folder: "sdtech/products", 
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto"
        }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
        uploadStream.end(buffer);
    });
  };

    const result = await streamUpload(optimizedBuffer);
    await logActivity(req.user!.id, "Uploaded product image", { url: result.secure_url });
    res.status(201).json({ imageUrl: result.secure_url });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message || "Failed to upload image" });
  }
};
