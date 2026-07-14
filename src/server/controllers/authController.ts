import { Response } from "express";
import { prisma } from "../db.js";
import { comparePassword } from "../hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, AuthenticatedRequest } from "../auth.js";

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !comparePassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set HTTP-only cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function refresh(req: AuthenticatedRequest, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Unauthorized: No refresh token provided" });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: "Unauthorized: Invalid or expired refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const accessToken = generateAccessToken(user);

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("Refresh error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    return res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
