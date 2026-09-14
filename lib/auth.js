import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
const JWT_SECRET = process.env.JWT_SECRET || "fintrack_super_secret_jwt_key_2026";
const TOKEN_NAME = "fintrack_token";
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}
export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
export async function getSessionUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(TOKEN_NAME)?.value;
        if (!token)
            return null;
        return verifyToken(token);
    }
    catch {
        return null;
    }
}
export async function requireAuthUser() {
    const session = await getSessionUser();
    if (!session) {
        throw new Error("Unauthorized");
    }
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true, currency: true },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}
