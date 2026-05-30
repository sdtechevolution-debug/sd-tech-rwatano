import { Request, Response } from "express";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logActivity } from "../utils/activity";

const signToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role === "OWNER" ? "OWNER" : "WORKER",
      phone,
    },
  });
  const token = signToken(user.id);
  await logActivity(user.id, "Registered user", { email: user.email, role: user.role });
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = signToken(user.id);
  await logActivity(user.id, "Logged in", { email: user.email });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  // req.user is attached by authenticate middleware; cast to any to access id and password
  const authReq = req as any;
  const user = authReq.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (!currentPassword || !newPassword) return res.status(400).json({ message: "Current and new password are required" });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  await logActivity(user.id, "Changed password", {});
  res.json({ message: "Password changed successfully" });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(200).json({ message: "If the email exists we'll send a reset link" });

  // create token
  const token = Math.random().toString(36).slice(2, 8).toUpperCase() + Math.random().toString(36).slice(2, 8);
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  await prisma.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt } });

  // send email with link (frontend will handle /reset-password?token=...)
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const html = `<p>Hello ${user.name},</p><p>You requested a password reset. Click the link below to reset your password (expires in 30 minutes):</p><p><a href="${resetLink}">Reset password</a></p>`;
  try {
    const { sendMail } = await import("../utils/mailer");
    await sendMail(email, "Reset your SD TECH password", html);
  } catch (e) {
    console.warn("Failed to send reset email", e);
  }

  return res.json({ message: "If the email exists we'll send a reset link" });
};

export const performPasswordReset = async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ message: "Email, token and newPassword are required" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: "Invalid token or email" });

  const resets = await prisma.passwordReset.findMany({ where: { userId: user.id, used: false }, orderBy: { createdAt: "desc" } });
  if (!resets || resets.length === 0) return res.status(400).json({ message: "Invalid token or email" });

  const candidate = resets[0];
  if (candidate.expiresAt < new Date()) return res.status(400).json({ message: "Token expired" });

  const valid = await bcrypt.compare(token, candidate.tokenHash);
  if (!valid) return res.status(400).json({ message: "Invalid token" });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  await prisma.passwordReset.update({ where: { id: candidate.id }, data: { used: true } });
  return res.json({ message: "Password reset successful" });
};
