"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Check } from "lucide-react";
import { registerUser } from "@/lib/api/auth";

// ---- Types ----
type Step = "info" | "password" | "success";

interface FormData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
}

// ---- Main Component ----
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [form, setForm] = useState<FormData>({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError("");
    };

  // Step 1: ตรวจ info แล้วไป step password
  const handleInfoNext = () => {
    const { firstname, lastname, username, email, phone_number } = form;
    if (!firstname || !lastname || !username || !email || !phone_number) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("รูปแบบ Email ไม่ถูกต้อง");
      return;
    }
    setError("");
    setStep("password");
  };

  // Step 2: ตรวจ password แล้ว register
  const handlePasswordNext = async () => {
    const { password, confirmPassword } = form;
    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await registerUser({
        firstname: form.firstname,
        lastname: form.lastname,
        username: form.username,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number,
      });
      setStep("success");
      // redirect หลัง 3 วินาที
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFC700] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl flex items-center gap-16">
          {/* Left — Logo */}
          <div className="hidden md:flex flex-col items-center flex-1">
            <Image
              src="/logo.png"
              alt="KanKluay Shopping"
              width={380}
              height={380}
              priority
            />
            <p className="mt-4 text-center text-[#1a1a1a] text-2xl font-bold leading-tight">
              แหล่งช้อปปิ้งออนไลน์ที่ใหญ่ที่สุด
              <br />
              ในบางมด
            </p>
          </div>

          {/* Right — Card */}
          <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-6 sm:p-8 box-border mx-auto md:mx-0">
          {/* <div className="w-full md:max-w-[400px] bg-white rounded-2xl shadow-lg p-8"> */}
            {/* STEP 1: ข้อมูลส่วนตัว */}
            {step === "info" && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-bold text-center text-[#1a1a1a]">
                  สมัครสมาชิก
                </h1>

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="ชื่อจริง"
                    value={form.firstname}
                    onChange={set("firstname")}
                    className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1B4D3E] transition"
                  />
                  <input
                    type="text"
                    placeholder="นามสกุล"
                    value={form.lastname}
                    onChange={set("lastname")}
                    className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1B4D3E] transition"
                  />
                </div>

                <input
                  type="text"
                  placeholder="ชื่อผู้ใช้ (username)"
                  value={form.username}
                  onChange={set("username")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1B4D3E] transition"
                />

                <input
                  type="email"
                  placeholder="อีเมล"
                  value={form.email}
                  onChange={set("email")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1B4D3E] transition"
                />

                <input
                  type="tel"
                  placeholder="หมายเลขโทรศัพท์"
                  value={form.phone_number}
                  onChange={set("phone_number")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1B4D3E] transition"
                />

                {error && (
                  <p className="text-red-500 text-xs text-center">{error}</p>
                )}

                <button
                  onClick={handleInfoNext}
                  className="w-full bg-[#1B4D3E] hover:bg-[#163d31] text-white rounded-lg py-3 text-sm font-semibold transition"
                >
                  ต่อไป
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">หรือ</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Social (UI only) */}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="#1877F2"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                </div>

                <p className="text-xs text-center text-gray-400 leading-relaxed">
                  โดยการเปิดบัญชี KanKluay ท่านรับทราบและตกตอดตาม{" "}
                  <Link href="#" className="text-[#FFC700] hover:underline">
                    เงื่อนไขการให้บริการ
                  </Link>{" "}
                  และ{" "}
                  <Link href="#" className="text-[#FFC700] hover:underline">
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </p>

                <p className="text-xs text-center text-gray-500">
                  หากมีบัญชีผู้ใช้แล้ว คุณสามารถ{" "}
                  <Link
                    href="/login"
                    className="text-[#FFC700] font-semibold hover:underline"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            )}

            {/* STEP 2: ตั้งรหัสผ่าน */}
            {step === "password" && (
              <div className="flex flex-col gap-5">
                <h1 className="text-xl font-bold text-center text-[#1a1a1a]">
                  ตั้งรหัสผ่าน
                </h1>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="รหัสผ่าน (ความยาวอย่างน้อย 8 ตัวอักษร)"
                    value={form.password}
                    onChange={set("password")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1B4D3E] transition pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="ใส่รหัสผ่านอีกครั้ง"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1B4D3E] transition pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                {error && (
                  <p className="text-red-500 text-xs text-center">{error}</p>
                )}

                <button
                  onClick={handlePasswordNext}
                  disabled={loading}
                  className="w-full bg-[#1B4D3E] hover:bg-[#163d31] text-white rounded-lg py-3 text-sm font-semibold transition disabled:opacity-60"
                >
                  {loading ? "กำลังสมัครสมาชิก..." : "ต่อไป"}
                </button>

                <button
                  onClick={() => {
                    setStep("info");
                    setError("");
                  }}
                  className="text-xs text-center text-gray-400 hover:text-gray-600 transition"
                >
                  ← ย้อนกลับ
                </button>
              </div>
            )}

            {/* STEP 3: สำเร็จ */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-5 py-4">
                <h1 className="text-xl font-bold text-[#1a1a1a]">
                  สมัครสมาชิก
                </h1>

                <div className="w-16 h-16 bg-[#4CAF50] rounded-xl flex items-center justify-center">
                  <Check size={32} color="white" strokeWidth={3} />
                </div>

                <div className="text-center space-y-1">
                  <p className="font-semibold text-[#1a1a1a]">
                    สมัครสมาชิกสำเร็จแล้ว
                  </p>
                  <p className="text-sm text-gray-500">
                    คุณจะถูกย้ายไปยังหน้าเข้าสู่ระบบภายใน 3 วินาที
                  </p>
                </div>

                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-[#1B4D3E] hover:bg-[#163d31] text-white rounded-lg py-3 text-sm font-semibold transition"
                >
                  เสร็จสิ้น
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-600 space-x-4">
        <Link href="#" className="hover:underline">
          Condition of Use
        </Link>
        <Link href="#" className="hover:underline">
          Privacy Notice
        </Link>
        <Link href="#" className="hover:underline">
          Help
        </Link>
        <p className="mt-1">© 2026, KanKluay.com, Inc. or its affiliates</p>
      </footer>
    </div>
  );
}
