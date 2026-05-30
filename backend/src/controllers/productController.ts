import { Response } from "express";
import prisma from "../utils/prisma";
import { logActivity } from "../utils/activity";
import { AuthRequest } from "../middleware/auth";
import { optimizeImage } from "../utils/imageOptimizer";
import cloudinary from "../utils/cloudinary";

export const getProducts = async (req: AuthRequest, res: Response) => {
  const products = await prisma.product.findMany({ include: { category: true } });
  res.json(products);
};

export const getProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

const streamUpload = (bufferToUpload: Buffer) => {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
      folder: 'sdtech/products',
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    uploadStream.end(bufferToUpload);
  });
};

const uploadDataUrlImage = async (dataUrl: string): Promise<string> => {
  const base64Data = dataUrl.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const optimized = await optimizeImage(buffer);
  const result = await streamUpload(optimized);
  return result.secure_url;
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, categoryId, description, stockQuantity, reorderPoint, buyPrice, sellPrice, imageUrl, barcode } = req.body;
  if (!name || !categoryId || buyPrice == null || sellPrice == null) {
    return res.status(400).json({ message: "Missing product fields" });
  }

  let finalImageUrl = imageUrl;

  // If frontend sent a data URL (base64), optimize and upload it before saving
  if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
    try {
      finalImageUrl = await uploadDataUrlImage(imageUrl);
    } catch (err) {
      console.error('Image processing/upload failed:', err);
      // proceed without replacing imageUrl; store original if upload fails
    }
  }

  const product = await prisma.product.create({
    data: {
      name,
      categoryId,
      description,
      stockQuantity: Number(stockQuantity) || 0,
      reorderPoint: Number(reorderPoint) || 5,
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      imageUrl: finalImageUrl,
      barcode,
    },
  });
  await logActivity(req.user?.id ?? "unknown", "Created product", { productId: product.id });
  res.status(201).json(product);
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, categoryId, description, stockQuantity, reorderPoint, buyPrice, sellPrice, imageUrl, barcode } = req.body;

  let finalImageUrl = imageUrl;
  if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
    try {
      finalImageUrl = await uploadDataUrlImage(imageUrl);
    } catch (err) {
      console.error('Image processing/upload failed:', err);
      // preserve original imageUrl if upload fails
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      categoryId,
      description,
      stockQuantity: stockQuantity != null ? Number(stockQuantity) : undefined,
      reorderPoint: reorderPoint != null ? Number(reorderPoint) : undefined,
      buyPrice: buyPrice != null ? Number(buyPrice) : undefined,
      sellPrice: sellPrice != null ? Number(sellPrice) : undefined,
      imageUrl: finalImageUrl,
      barcode,
    },
  });
  await logActivity(req.user?.id ?? "unknown", "Updated product", { productId: product.id });
  res.json(product);
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id } });
    await logActivity(req.user?.id ?? "unknown", "Deleted product", { productId: id });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2003') {
      return res.status(400).json({ message: 'Cannot delete product because it is referenced in sales. Consider archiving it or removing related sale items first.' });
    }
    console.error('Failed to delete product:', err);
    return res.status(500).json({ message: 'Failed to delete product.' });
  }
};
