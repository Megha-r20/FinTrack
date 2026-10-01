import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis;

function createPrismaClient() {
    let adapter;
    if (process.env.TURSO_DATABASE_URL) {
        adapter = new PrismaLibSql({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    } else if (process.env.DATABASE_URL?.startsWith("libsql://")) {
        adapter = new PrismaLibSql({
            url: process.env.DATABASE_URL,
        });
    } else {
        const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
        const normalizedPath = dbPath.replace(/\\/g, "/");
        const url = process.env.DATABASE_URL || `file:${normalizedPath}`;
        adapter = new PrismaLibSql({ url });
    }
    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;
