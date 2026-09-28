import { LayoutGrid } from "lucide-react";

// Halaman "Pilihan Aplikasi" ada di admin-NG (/select) dan dipakai bersama
// oleh semua app SSO. Default di-hardcode agar tidak wajib env; override
// lewat VITE_APP_SELECTOR_URL (di-inline saat build).
const APP_SELECTOR_URL =
  import.meta.env.VITE_APP_SELECTOR_URL || "https://admin-ng.iom-itb.id/select";

export default function AppSelectorFab() {
  return (
    <a
      href={APP_SELECTOR_URL}
      className="group fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-800 text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
      title="Kembali ke Pilihan Aplikasi"
      aria-label="Kembali ke Pilihan Aplikasi"
    >
      <LayoutGrid className="h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
      <span className="pointer-events-none absolute right-0 bottom-[calc(100%+8px)] rounded-md bg-slate-800 px-3 py-1.5 text-[12px] font-medium whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Pilihan Aplikasi
      </span>
    </a>
  );
}
