"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function saveToNeon(content: string) {
  if (!content) return;
  try {
    await prisma.post.create({
      data: { content: content },
    });
    revalidatePath("/"); // Ini penting agar cache Next.js diperbarui
  } catch (error) {
    console.error("Gagal simpan:", error);
    throw error;
  }
}

// Tambahkan fungsi ini untuk menarik data
export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" }, // Yang terbaru di atas
    });
    return posts;
  } catch (error) {
    console.error("Gagal ambil data:", error);
    return [];
  }
}