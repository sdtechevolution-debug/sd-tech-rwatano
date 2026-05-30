import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }
  const category = await prisma.category.create({ data: { name, description } });
  res.status(201).json(category);
};
