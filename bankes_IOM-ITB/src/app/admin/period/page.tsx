"use client";

import SidebarAdmin from "@/app/components/layout/sidebaradmin";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface Period {
  period_id: number;
  period: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_open: boolean;
}

export default function PeriodPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [newPeriod, setNewPeriod] = useState({
    period: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [periodsResponse, currentResponse] = await Promise.all([
          fetch("/api/periods"),
          fetch("/api/periods/current"),
        ]);

        const periodsData: Period[] = await periodsResponse.json();
        const sortedPeriods = [...periodsData].sort((a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
        setPeriods(sortedPeriods);

        const currentData: Period | null = await currentResponse.json();
        setCurrentPeriod(currentData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const setCurrent = async (id: number) => {
    try {
      setLoading(true);
      await fetch(`/api/periods/set-current/${id}`, { method: "PUT" });

      const updatedPeriods = periods.map((p: Period) =>
        p.period_id === id ? { ...p, is_current: true } : { ...p, is_current: false }
      );
      setPeriods(updatedPeriods as Period[]);

      const newCurrentPeriod = updatedPeriods.find((p) => p.is_current);
      setCurrentPeriod(newCurrentPeriod || null);
    } catch (error) {
      console.error("Error setting current period:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRegistration = async (id: number) => {
    try {
      setLoading(true);
      await fetch(`/api/periods/toggle-open/${id}`, { method: "PUT" });

      const updatedPeriods = periods.map((p: Period) =>
        p.period_id === id ? { ...p, is_open: !p.is_open } : p
      );
      setPeriods(updatedPeriods as Period[]);

      if (currentPeriod?.period_id === id) {
        setCurrentPeriod({ ...currentPeriod, is_open: !currentPeriod.is_open });
      }
    } catch (error) {
      console.error("Error toggling registration:", error);
      alert("Failed to toggle registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createPeriod = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/periods/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPeriod),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.message || "Gagal membuat periode.");
        return;
      }

      const createdPeriod: Period = await response.json();
      const updatedPeriods = [...periods, createdPeriod].sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      setPeriods(updatedPeriods);
      setNewPeriod({ period: "", start_date: "", end_date: "" });
    } catch (error) {
      console.error("Error creating period:", error);
      alert("Terjadi kesalahan saat membuat periode.");
    } finally {
      setLoading(false);
    }
  };

  const deletePeriod = async (id: number) => {
    if (!confirm("Hapus periode ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/periods/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const err = await response.json();
        alert(err.message || "Gagal menghapus periode.");
        return;
      }

      setPeriods(periods.filter((p) => p.period_id !== id));
    } catch (error) {
      console.error("Error deleting period:", error);
      alert("Terjadi kesalahan saat menghapus periode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-0 md:w-64 shrink-0">
        <SidebarAdmin activeTab="period" />
      </div>

      <div className="flex-1 min-w-0 my-4 mx-4 pt-16 md:pt-0 md:my-8 md:mr-8">
        <h1 className="text-2xl font-bold mb-6">Periode Bantuan Kesejahteraan</h1>

        <Card className="p-4 sm:p-6 md:p-8 w-full">
          {loading ? 
            (
              <p className="text-lg">Loading...</p>
            ) : (
              <>
                <div className="bg-white p-6 rounded shadow mb-6">
                  <h2 className="text-xl font-bold mb-4">Periode Sekarang:</h2>
                  <p>{currentPeriod?.period || "Tidak ada periode aktif"}</p>
                </div>

                <div className="bg-white p-6 rounded shadow mb-6">
                  <h2 className="text-xl font-bold mb-4">Daftar Periode</h2>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2">Nama Periode</th>
                        <th className="border p-2">Mulai</th>
                        <th className="border p-2">Berakhir</th>
                        <th className="border p-2">Periode Sekarang</th>
                        <th className="border p-2">Status Pendaftaran</th>
                        <th className="border p-2">Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map((p: Period) => (
                        <tr key={p.period_id}>
                          <td className="border p-2">{p.period}</td>
                          <td className="border p-2">
                            {new Date(p.start_date).toLocaleDateString()}
                          </td>
                          <td className="border p-2">
                            {new Date(p.end_date).toLocaleDateString()}
                          </td>
                          <td className="border p-2">
                            {currentPeriod?.period_id !== p.period_id ? (
                              <button
                                onClick={() => setCurrent(p.period_id)}
                                disabled={loading}
                                className={`${
                                  loading ? "opacity-50 cursor-not-allowed" : ""
                                } bg-main text-white px-2 py-1 rounded-md hover:bg-[#b5c3e1]`}
                              >
                                Buat Periode Sekarang
                              </button>
                            ) : (
                              <p>Periode Sekarang</p>
                            )}
                          </td>
                          <td className="border p-2">
                            {p.is_current && (
                              <button
                                onClick={() => toggleRegistration(p.period_id)}
                                disabled={loading}
                                className={`${
                                  loading ? "opacity-50 cursor-not-allowed" : ""
                                } bg-main text-white px-2 py-1 rounded-md hover:bg-[#b5c3e1]`}
                              >
                                {p.is_open ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
                              </button>
                            )}
                          </td>
                          <td className="border p-2">
                            {!p.is_current && !p.is_open && (
                              <button
                                onClick={() => deletePeriod(p.period_id)}
                                disabled={loading}
                                className={`${
                                  loading ? "opacity-50 cursor-not-allowed" : ""
                                } bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-400`}
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4">Buat Periode Baru</h2>
                  <div className="mb-4">
                    <label className="block mb-1">Nama Periode:</label>
                    <input
                      type="text"
                      value={newPeriod.period}
                      onChange={(e) =>
                        setNewPeriod({ ...newPeriod, period: e.target.value })
                      }
                      className="block w-full p-2 border rounded"
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1">Tanggal Mulai:</label>
                    <input
                      type="date"
                      value={newPeriod.start_date}
                      onChange={(e) =>
                        setNewPeriod({ ...newPeriod, start_date: e.target.value })
                      }
                      className="block w-full p-2 border rounded"
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1">Tanggal Berakhir:</label>
                    <input
                      type="date"
                      value={newPeriod.end_date}
                      onChange={(e) =>
                        setNewPeriod({ ...newPeriod, end_date: e.target.value })
                      }
                      className="block w-full p-2 border rounded"
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={createPeriod}
                    disabled={loading}
                    className={`${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    } bg-main text-white px-4 py-2 rounded-md hover:bg-[#b5c3e1]`}
                  >
                    Buat Periode
                  </button>
                </div>
              </>
            )
          }
        </Card>
      </div>
    </div>
  );
}