"use client";

import SidebarMahasiswa from "@/app/components/layout/sidebarmahasiswa";
import { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";


interface UploadResponse {
  success: boolean;
  fileName?: string;
  fileUrl?: string;
  error?: string;
}

interface FileData {
  fileUrl: string;
  fileName: string;
  type: string;
}

export default function Upload() {
  const { data: session } = useSession();

  const [selectedFiles, setSelectedFiles] = useState<{ key: string; file: File }[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [fileTypes, setFileTypes] = useState<{ title: string; key: string }[]>([]);
  const [loadingFileTypes, setLoadingFileTypes] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      if (session?.user?.id) {
        try {
          const response = await axios.get<FileData[]>(`/api/files/fetch/${session.user.id}`);
          setUploadedFiles(response.data);
        } catch (error) {
          console.error("Error fetching files:", error);
        }
      }
    };

    fetchFiles();
  }, [session]);

  useEffect(() => {
    const fetchFileTypes = async () => {
      setLoadingFileTypes(true);
      try {
        const response = await axios.get("/api/files/file-types");
        if (response.data.success) {
          setFileTypes(response.data.data);
        } else {
          toast.error(response.data.error || "Gagal memuat jenis berkas.");
        }
      } catch (error) {
        console.error("Error fetching file types:", error);
        toast.error("Terjadi kesalahan saat memuat jenis berkas.");
      } finally {
        setLoadingFileTypes(false);
      }
    };

    fetchFileTypes();
  }, []);

  const handleFileSelect = (key: string, file: File) => {
    const validTypes = ["image/png", "image/jpeg", "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error("Jenis berkas tidak valid. Hanya PNG, JPG, dan PDF yang diizinkan.");
      return;
    }
    if (file.size > maxSize) {
      toast.error("Ukuran berkas terlalu besar. Maksimal 5MB.");
      return;
    }

    setSelectedFiles((prev) => [...prev.filter((f) => f.key !== key), { key, file }]);
    toast.info(`Berkas "${file.name}" dipilih untuk ${fileTypes.find(ft => ft.key === key)?.title || 'dokumen'}.`);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Tidak ada berkas yang dipilih untuk diunggah.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(({ key, file }) => {
      formData.append("files", file);
      formData.append("documentTypes", key);
    });

    const toastId = toast.loading("Mengunggah berkas...");
    try {
      const response = await axios.post<UploadResponse>("/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Semua berkas berhasil diunggah!", { id: toastId });
        setSelectedFiles([]);
        location.reload();
      } else {
        toast.error(response.data.error || "Gagal mengunggah sebagian atau semua berkas.", { id: toastId });
      }
    } catch (error: any) {
      console.error("Error uploading files:", error);
      const errorMessage = error.response?.data?.error || "Terjadi kesalahan saat mengunggah berkas.";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleDelete = async (fileTypeKey: string) => {
    const fileToDelete = uploadedFiles.find(f => f.type === fileTypeKey);
    if (!fileToDelete) {
      toast.error("Berkas tidak ditemukan.");
      return;
    }
    const toastId = toast.loading(`Menghapus ${fileToDelete.fileName}...`);
    try {
      const response = await axios.delete("/api/files/delete", {
        data: { fileType: fileTypeKey },
      });

      if (response.data.success) {
        toast.success("Berkas berhasil dihapus!", { id: toastId });
        setUploadedFiles((prev) => prev.filter((file) => file.type !== fileTypeKey));
      } else {
        toast.error(response.data.error || "Gagal menghapus berkas.", { id: toastId });
      }
    } catch (error: any) {
      console.error("Error deleting file:", error);
      const errorMessage = error.response?.data?.error || "Terjadi kesalahan saat menghapus berkas.";
      toast.error(errorMessage, { id: toastId });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100"> {/* Main page background */}
      <Toaster position="bottom-right" richColors />
      <div className="w-0 md:w-64 shrink-0">
        <SidebarMahasiswa activeTab="upload" />
      </div>

      <div className="flex-1 min-w-0 my-4 mx-4 pt-16 md:pt-0 md:my-8 md:mr-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Unggah Dokumen</h1>

        <div className="w-full bg-white rounded-xl shadow-lg p-6 md:p-8"> {/* Content container with subtle shadow and padding */}
          {loadingFileTypes ? (
            <div className="flex flex-col items-center justify-center py-10">
              <svg className="animate-spin h-8 w-8 text-main mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-500">Memuat jenis dokumen...</p>
            </div>
          ) : fileTypes.length === 0 ? (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-400 mx-auto mb-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p className="text-slate-600 text-xl font-semibold mb-1">Tidak Ada Jenis Dokumen</p>
              <p className="text-slate-400 text-sm">Saat ini tidak ada jenis dokumen yang perlu diunggah.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {fileTypes.map((type) => {
                const selectedFile = selectedFiles.find((f) => f.key === type.key);
                const existingFile = uploadedFiles.find((file) => file.type === type.key);

                return (
                  <div key={type.key} className="pb-8 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <h2 className="text-xl font-semibold text-slate-700 mb-1">{type.title}</h2>
                    <p className="text-sm text-slate-500 mb-4">
                      {existingFile
                        ? "Anda sudah mengunggah berkas ini."
                        : selectedFile
                          ? "Berkas siap diunggah."
                          : "Silakan pilih berkas untuk diunggah."}
                    </p>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* File Input / Selected File Display */}
                      <div className="w-full md:flex-1">
                        <label
                          htmlFor={`file-upload-${type.key}`}
                          className="relative flex items-center w-full p-3.5 border border-gray-300 rounded-lg text-sm bg-gray-50 hover:border-gray-400 focus-within:border-main focus-within:ring-1 focus-within:ring-main cursor-pointer transition-colors group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <span className="truncate flex-grow text-gray-700 group-hover:text-gray-800">
                            {selectedFile ? selectedFile.file.name : `Pilih berkas ${type.title.toLowerCase()} (.pdf, .jpg, .png)`}
                          </span>
                          <span className="ml-3 pl-3 text-xs font-semibold uppercase text-main group-hover:text-maindark border-l border-gray-200 group-hover:border-gray-300 whitespace-nowrap">
                            {selectedFile ? "Ganti Berkas" : "Pilih Berkas"}
                          </span>
                          <input
                            id={`file-upload-${type.key}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileSelect(type.key, file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>

                      {/* Existing File Info & Delete Button */}
                      {existingFile && (
                        <div className="flex items-center space-x-3 mt-2 md:mt-0 md:w-auto flex-shrink-0 pl-0 md:pl-4">
                          <a
                            href={existingFile.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center py-1.5"
                            title={`Lihat ${existingFile.fileName}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5 flex-shrink-0">
                              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5Z" />
                              <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.879-1.148a1.65 1.65 0 00-.523-2.318l-.995-.666a1.65 1.65 0 01-.342-2.37L1.29 2.295a1.65 1.65 0 012.37-.342l.996.666a1.65 1.65 0 002.318-.523l1.148-.879A1.65 1.65 0 0110.59.664l1.18 0c.423 0 .83.143 1.148.379l1.148.879a1.65 1.65 0 002.318.523l.996-.666a1.65 1.65 0 012.37.342L18.71 3.5a1.65 1.65 0 01-.342 2.37l-.995.666a1.65 1.65 0 00-.523 2.318l.879 1.148a1.651 1.651 0 010 1.18l-.879 1.148a1.65 1.65 0 00.523 2.318l.995.666a1.65 1.65 0 01.342 2.37L18.71 17.705a1.65 1.65 0 01-2.37.342l-.996-.666a1.65 1.65 0 00-2.318.523l-1.148.879A1.65 1.65 0 019.41.336l-1.18 0a1.651 1.651 0 01-1.148-.379l-1.148-.879a1.65 1.65 0 00-2.318-.523l-.996.666a1.65 1.65 0 01-2.37-.342L1.29 16.5a1.65 1.65 0 01.342-2.37l.995-.666a1.65 1.65 0 00.523-2.318L.664 10.59zM10 15.25a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate max-w-[120px] sm:max-w-[180px]">{existingFile.fileName}</span>
                          </a>
                          <button
                            onClick={() => handleDelete(existingFile.type)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title={`Hapus ${existingFile.fileName}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.197-2.326.368a.75.75 0 00-.512.734v1.75a.75.75 0 00.75.75H4.5v8.25A3.75 3.75 0 008.25 19h3.5A3.75 3.75 0 0015.5 15.25V8.75h.75a.75.75 0 00.75-.75v-1.75a.75.75 0 00-.512-.734c-.746-.17-1.531-.291-2.326-.368v-.443A2.75 2.75 0 0011.25 1h-2.5zM7.5 3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.443c-.708.07-1.406.183-2.09.326a.75.75 0 00-.82 0c-.684-.143-1.382-.255-2.09-.326V3.75z" clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">Hapus berkas</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {fileTypes.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0}
                    className="bg-main text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-maindark transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}