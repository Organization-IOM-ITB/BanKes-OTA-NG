"use client";

import { useSession } from "next-auth/react";

// Halaman "Pilihan Aplikasi" ada di admin-NG (/select) dan dipakai bersama
// oleh semua app SSO. Default di-hardcode agar tidak wajib env; override
// lewat NEXT_PUBLIC_APP_SELECTOR_URL (di-inline saat build).
const APP_SELECTOR_URL =
  process.env.NEXT_PUBLIC_APP_SELECTOR_URL || "https://admin-ng.iom-itb.id/select";

export default function AppSelectorFab() {
  const { status } = useSession();

  // Pilihan Aplikasi hanya berarti bagi user yang sudah login SSO.
  if (status !== "authenticated") return null;

  return (
    <a
      href={APP_SELECTOR_URL}
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-800 text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
      title="Kembali ke Pilihan Aplikasi"
      aria-label="Kembali ke Pilihan Aplikasi"
    >
      <svg
        className="h-6 w-6 transition-transform group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
      <span className="pointer-events-none absolute bottom-[calc(100%+8px)] right-0 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Pilihan Aplikasi
      </span>
    </a>
  );
}
