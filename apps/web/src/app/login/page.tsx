"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State Toast
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  // Fungsi Toast biar gampang dipakai
  const showToast = (msg: string, isSuccess: boolean) => {
    // 1. Render elemen ke DOM dulu dalam posisi transparan (isVisible: false)
    setIsSuccessMessage(isSuccess);
    setMessage(msg);
    setIsVisible(false);

    // 2. Kasih jeda super singkat biar browser nyadar elemennya ada, baru tembak kelas opacity-100
    setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // 3. Timer 5 detik sebelum fade out
    setTimeout(() => {
      setIsVisible(false);
      // Tunggu transisi fade-out selesai (500ms) baru hilangkan elemen dari DOM
      setTimeout(() => setMessage(""), 500);
    }, 3000); // 3 detik tampil
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Simpan ke localStorage buat fallback & Cookie buat middleware
        console.log("[Login] Success, setting token in storage...");
        localStorage.setItem("token", data.access_token);
        document.cookie = `token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`;

        showToast("Login berhasil! Mengalihkan...", true);
        setTimeout(() => {
          // Cek kalau ada url redirect (misal balikan dari SEO explore)
          const redirectUrl = searchParams.get("redirect");

          if (redirectUrl) {
            console.log(`[Login] Redirecting back to ${redirectUrl}...`);
            window.location.href = redirectUrl;
          } else {
            console.log("[Login] Redirecting to beranda...");
            window.location.href = "/id/home";
          }
        }, 1500);
      } else {
        console.log("[Login] Failed:", data.message);
        showToast(data.message || 'Kredensial salah', false);
      }
    } catch (err) {
      console.error("[Login] Error:", err);
      showToast("Gagal login, server bermasalah.", false);
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-white sm:bg-gray-100 text-slate-800 font-sans pt-16 pb-12 sm:p-24">
      {/* Header Khusus Mobile (Murni fixed di root viewport) */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 flex justify-center py-4 border-b border-gray-100 sm:hidden">
        <div className="-ml-3 w-full flex justify-center">
          <img src="/logo-horizontal.png" alt="Nethubz.com" className="h-10 object-contain" />
        </div>
      </div>

      <div className="w-full max-w-md px-8 sm:p-10 sm:bg-white sm:rounded-2xl sm:shadow-xl relative overflow-hidden">

        {/* Dekorasi blur di background atas biar manis */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10">

          <div className="hidden sm:flex justify-center mb-4 w-full -ml-4">
            <img src="/logo-horizontal.png" alt="Nethubz.com" className="h-14 object-contain" />
          </div>

          <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Login akun</h2>
          <p className="text-center text-gray-500 mb-6 text-sm">Selamat datang kembali! Yuk lanjut mencari.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-800">Email/Username</label>
              <input type="text" placeholder="name@example.com atau username" required
                className="w-full border-2 border-gray-200 p-3.5 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                value={formData.identifier} onChange={e => setFormData({ ...formData, identifier: e.target.value })} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-gray-800">Password</label>
                <Link href="/forgot-password" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" required
                  className="w-full border-2 border-gray-200 p-3.5 pr-14 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.identifier.trim() || !formData.password.trim()}
              className="w-full bg-emerald-600 text-white p-3.5 rounded-xl font-bold tracking-wide hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link href="/register" className="text-emerald-600 font-bold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>

        {/* Toast dengan animasi mulus Fade In / Fade Out */}
        {message && (
          <div className={`fixed bottom-10 sm:bottom-auto sm:top-10 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 min-w-[320px] rounded-xl shadow-2xl border text-sm font-semibold text-center transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 sm:-translate-y-6'} ${isSuccessMessage ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
