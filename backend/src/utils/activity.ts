import prisma from "./prisma";

export const logActivity = async (userId: string, action: string, meta?: object) => {
  return prisma.activity.create({
    data: {
      userId,
      action,
      meta,
    },
  });
};
