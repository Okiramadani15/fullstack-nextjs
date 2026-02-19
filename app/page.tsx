"use client";

import { useState, useEffect } from "react";
import { saveToNeon, getPosts } from "./actions";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  // Ambil data saat pertama kali halaman dibuka
  const loadData = async () => {
    const data = await getPosts();
    setPosts(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!text.trim()) return alert("Ketik sesuatu dulu!");
    
    setLoading(true);
    try {
      await saveToNeon(text);
      setText(""); 
      await loadData(); // Ambil data terbaru setelah simpan sukses
      alert("Berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan ke database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 p-6 pt-10">
      {/* Container Form */}
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow-lg border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900">AI Content Ideas</h1>
        <p className="text-sm text-zinc-500">Simpan ide kreatifmu langsung ke database.</p>
        
        <textarea
          className="w-full rounded-lg border border-zinc-300 p-3 text-black focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Tulis ide di sini..."
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-zinc-400 transition-all"
        >
          {loading ? "Proses..." : "Simpan Ide ✨"}
        </button>
      </div>

      {/* Container List Data */}
      <div className="w-full max-w-md mt-10">
        <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
        </h2>
        
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-center text-zinc-400 text-sm py-10 italic">Belum ada data di database.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
                <p className="text-zinc-800 text-sm leading-relaxed">{post.content}</p>
                <p className="text-[10px] text-zinc-400 mt-2 italic">
                  {new Date(post.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}