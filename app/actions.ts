"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Inisialisasi API Key & Client AI
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * Menyimpan ide secara manual ke database Neon
 */
export async function saveToNeon(content: string) {
  if (!content.trim()) return;
  try {
    await prisma.post.create({
      data: { content: content },
    });
    revalidatePath("/"); 
  } catch (error) {
    console.error("Gagal simpan ke Neon:", error);
    throw new Error("Gagal menyimpan ke database.");
  }
}

/**
 * Mengambil semua data ide dari database
 */
export async function getPosts() {
  try {
    return await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    return [];
  }
}

/**
 * Menghapus ide berdasarkan ID
 */
export async function deletePost(id: number) {
  try {
    await prisma.post.delete({
      where: { id: id },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Gagal menghapus data:", error);
    throw new Error("Gagal menghapus data dari database.");
  }
}

/**
 * Menghasilkan ide menggunakan Google Gemini AI
 * dan menyimpannya langsung ke database
 */
export async function generateAIIdea(prompt: string) {
  if (!apiKey) {
    throw new Error("API Key Gemini tidak ditemukan di .env");
  }

  try {
    // Menggunakan model 'gemini-1.5-flash' (tercepat & paling hemat kuota)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = `Berikan 1 ide konten kreatif, singkat, dan menarik untuk topik: ${prompt}. Langsung berikan isinya saja tanpa kalimat pembuka atau penutup.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiText = response.text();

    if (!aiText) throw new Error("Respons AI kosong");

    // Simpan hasil AI ke database
    await prisma.post.create({
      data: { content: aiText },
    });

    revalidatePath("/");
    return aiText;
  } catch (error: any) {
    console.error("AI Error Detail:", error.message);
    throw new Error("Gagal mendapatkan respon dari AI.");
  }
}