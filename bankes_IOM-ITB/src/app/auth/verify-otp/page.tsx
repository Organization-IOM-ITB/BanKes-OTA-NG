"use client"
import { Suspense, useState } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!code.trim()) {
      setError("Kode verifikasi wajib diisi.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || "Gagal memverifikasi kode.")
        return
      }

      setInfo(data.message)
      setTimeout(() => router.push("/auth/login"), 2500)
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setInfo(null)
    setIsResending(true)
    try {
      const response = await fetch("/api/users/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || "Gagal mengirim ulang kode.")
        return
      }

      setInfo(data.message)
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md my-[5%]">
        <h1 className="text-2xl font-bold mb-2 text-center text-var">Verifikasi Email</h1>

        <p className="text-sm text-center text-gray-600 mb-6">
          Kami telah mengirimkan kode 6 karakter ke
          {email ? <strong className="block mt-1 text-black">{email}</strong> : " email Anda."}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            {error}
          </div>
        )}
        {info && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="status">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-2">
              Kode Verifikasi
            </label>
            <input
              type="text"
              name="code"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoComplete="one-time-code"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center text-lg tracking-[0.5em] font-mono"
              placeholder="A1B2C3"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="mx-auto bg-var hover:bg-var/90 cursor-pointer text-white py-2 px-4 rounded-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Memverifikasi..." : "Verifikasi"}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm">
          <span className="mr-1">Belum menerima kode?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-var font-bold hover:underline cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isResending ? "Mengirim..." : "Kirim ulang"}
          </button>
        </div>

        <div className="text-center mt-2 text-sm">
          <Link href="/auth/login" className="text-gray-500 hover:underline">
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  )
}
