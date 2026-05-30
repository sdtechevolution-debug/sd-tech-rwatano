import prisma from "../src/utils/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const password = await bcrypt.hash("Admin123!", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@sdtech.com" },
    update: {},
    create: {
      name: "SD Tech Owner",
      email: "owner@sdtech.com",
      password,
      role: "OWNER",
      phone: "+256700000000",
    },
  });

  await prisma.user.upsert({
    where: { email: "worker@sdtech.com" },
    update: {},
    create: {
      name: "Worker One",
      email: "worker@sdtech.com",
      password: await bcrypt.hash("Worker123!", 10),
      role: "WORKER",
      phone: "+256700000001",
    },
  });

  const categories = [
    "Chargers",
    "USB cables",
    "Covers",
    "Batteries",
    "Phones",
    "Radios",
    "Headphones",
    "Classroom materials",
    "Office materials",
    "Others",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} products` },
    });
  }

  const phoneCategory = await prisma.category.findUnique({ where: { name: "Phones" } });
  const usbCategory = await prisma.category.findUnique({ where: { name: "USB cables" } });

  if (phoneCategory) {
    await prisma.product.upsert({
      where: { barcode: "PHONE-001" },
      update: {},
      create: {
        name: "Smartphone A1",
        barcode: "PHONE-001",
        categoryId: phoneCategory.id,
        description: "Entry-level smartphone for everyday use.",
        stockQuantity: 16,
        reorderPoint: 3,
        buyPrice: 260.0,
        sellPrice: 320.0,
        imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      },
    });
  }

  if (usbCategory) {
    await prisma.product.upsert({
      where: { barcode: "USB-001" },
      update: {},
      create: {
        name: "USB Type-C Cable",
        barcode: "USB-001",
        categoryId: usbCategory.id,
        description: "Durable 1m charging cable.",
        stockQuantity: 50,
        reorderPoint: 10,
        buyPrice: 3.0,
        sellPrice: 7.5,
        imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      },
    });
  }

  console.log("Seed data created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
