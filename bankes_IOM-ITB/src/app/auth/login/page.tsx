'use client'
import { Suspense, useEffect, useState } from "react"
import Link from 'next/link';
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"
import { Toaster } from "sonner";

// Pesan untuk kode error NextAuth (?error=...) setelah redirect dari Keycloak
const SSO_ERROR_MESSAGES: Record<string, string> = {
    OAuthSignin: "Tidak dapat menghubungi server SSO IOM-ITB. Silakan coba lagi.",
    OAuthCallback: "Login SSO gagal diproses. Silakan coba lagi.",
    OAuthAccountNotLinked: "Email ini sudah terhubung dengan metode login lain. Hubungi admin.",
    Callback: "Terjadi kesalahan saat memproses akun Anda. Hubungi admin.",
    AccessDenied: "Akses ditolak.",
    Configuration: "Konfigurasi SSO pada server belum lengkap. Hubungi admin.",
    SessionRequired: "Silakan login terlebih dahulu.",
};

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { status } = useSession();
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Tampilkan error dari NextAuth (mis. /auth/login?error=OAuthCallback)
    useEffect(() => {
        const code = searchParams.get("error")
        if (code) {
            setError(SSO_ERROR_MESSAGES[code] ?? "Login gagal. Silakan coba lagi.")
        }
    }, [searchParams])

    // Sudah login: serahkan ke halaman utama yang mengarahkan sesuai role
    useEffect(() => {
        if (status === "authenticated") router.replace("/")
    }, [status, router])

    const handleSSOLogin = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // signIn melakukan redirect penuh ke Keycloak; halaman "/" yang
            // mengarahkan user ke dashboard sesuai role setelah kembali.
            await signIn("keycloak", { callbackUrl: "/" })
        } catch (err) {
            setError("Gagal melakukan login. Silakan coba lagi.")
            console.error("SSO login error:", err)
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center px-4" style={{ backgroundImage: "url('/bg.png')" }}>
            <Toaster />
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md my-[5%]">
                <h1 className="text-2xl font-bold mb-2 text-center text-var">
                    Masuk ke Akun Anda
                </h1>

                <div className="text-center font-normal mb-6">
                    <span className="text-sm mr-1">
                        Belum punya akun?
                    </span>
                    <Link href="/auth/register" className="text-sm text-var font-bold hover:underline">
                        Daftar
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={handleSSOLogin}
                        disabled={isLoading || status === "loading"}
                        className="w-full bg-var hover:bg-var/90 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition duration-200"
                    >
                        {isLoading ? "Mengalihkan ke SSO..." : "Login dengan SSO IOM-ITB"}
                    </button>

                    <div className="text-center text-sm text-gray-600">
                        <p>Gunakan akun SSO IOM-ITB yang sama untuk Bankes dan OTA.</p>
                        <p className="text-xs mt-2">Hubungi admin jika mengalami masalah login.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
    )
}
