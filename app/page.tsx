"use client";

import { useState, useEffect } from "react";
import { saveToNeon, getPosts, deletePost, generateAIIdea } from "./actions";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  const loadData = async () => {
    const data = await getPosts();
    setPosts(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await saveToNeon(text);
      setText(""); 
      await loadData();
    } catch (error) {
      alert("Terjadi gangguan koneksi ke database.");
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!text.trim()) return alert("Ketik topik dulu!");
    setLoading(true);
    try {
      await generateAIIdea(text);
      setText("");
      await loadData();
    } catch (error) {
      alert("AI sedang sibuk, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#fcfcfd] text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 font-sans">
      
      {/* Hero Section */}
      <header className="w-full max-w-2xl pt-16 pb-10 text-center px-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl drop-shadow-sm">
          OKI <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Vault AI</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-md mx-auto">
          Tangkap ide kreatif Anda secara instan dan kembangkan dengan kecerdasan buatan.
        </p>
      </header>

      <main className="w-full max-w-xl px-4 flex-grow">
        {/* Input Card */}
        <div className="rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-100">
          <div className="p-6">
            <textarea
              className="w-full min-h-[140px] resize-none bg-transparent text-lg placeholder:text-slate-400 focus:outline-none leading-relaxed"
              placeholder="Apa topik atau ide yang ingin Anda kembangkan hari ini?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
            
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-50 pt-5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">
                  {text.length} Karakter
                </span>
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">{loading ? 'Processing' : 'Ready'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading || !text.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
                >
                  {loading ? "..." : "Simpan Manual"}
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={loading || !text.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 px-6 py-3 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-50 active:scale-95 disabled:opacity-20 disabled:pointer-events-none shadow-sm shadow-indigo-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Thinking...
                    </span>
                  ) : (
                    "Bantuan AI"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List Section */}
        <section className="mt-20 pb-24">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 whitespace-nowrap">
              Koleksi Ide Kreatif
            </h2>
            <div className="h-[1px] w-full bg-slate-100" />
          </div>
          
          <div className="grid gap-6">
            {posts.length === 0 && !loading ? (
              <div className="py-20 text-center rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 text-sm font-medium">Belum ada ide yang tersimpan di Vault Anda.</p>
              </div>
            ) : (
              posts.map((post) => (
                <article 
                  key={post.id} 
                  className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start gap-6">
                    <p className="text-slate-700 leading-relaxed text-lg font-medium">
                      {post.content}
                    </p>
                    <button
                      onClick={async () => {
                        if(confirm("Hapus ide ini?")) {
                          await deletePost(post.id);
                          await loadData();
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all duration-200 p-2 rounded-lg hover:bg-red-50"
                      title="Hapus"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-indigo-400"></span>
                    <time className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(post.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-slate-100 text-center bg-white/50 backdrop-blur-sm">
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} <span className="text-slate-600 font-bold">OKIRAMADANI2026</span> • Crafted with AI
        </p>
      </footer>
    </div>
  );
}