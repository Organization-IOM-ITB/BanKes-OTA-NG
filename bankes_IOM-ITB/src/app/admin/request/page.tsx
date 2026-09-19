"use client";

import SidebarAdmin from "@/app/components/layout/sidebaradmin";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { User }  from "@/types/index";

export default function AccountPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/awaiting", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      const defaults: Record<string, string> = {};
      data.forEach((u: User) => { defaults[u.id] = "Pewawancara"; });
      setRoleMap(defaults);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = (userId: string, newRole: string) => {
    setRoleMap(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleReject = async (userId: string) => {
    setLoadingId(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to reject user");
      fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAccept = async (userId: string) => {
    setLoadingId(userId);
    try {
      const selectedRole = roleMap[userId];
      // Guest users (pending, no Keycloak account yet) must go through the
      // approval endpoint — it's the one that actually creates their Keycloak
      // account with the chosen role. /api/users/[id] refuses Guest users on
      // purpose and points here instead.
      const response = await fetch(`/api/admin/users/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: selectedRole }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(`Gagal: ${result.error || result.message}`);
        return;
      }

      if (result.temporaryPassword) {
        // TODO: kirim otomatis ke user (email/WA) alih-alih ditampilkan ke admin.
        alert(
          `User ${result.user?.email} berhasil disetujui.\n\nPassword sementara: ${result.temporaryPassword}\n\nSampaikan ke user secara manual — belum ada pengiriman otomatis.`
        );
      }

      fetchUsers();
    } catch (error) {
      console.error("Error accepting user:", error);    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-0 md:w-64 shrink-0">
        <SidebarAdmin activeTab="request" />
      </div>
      <div className="flex-1 min-w-0 my-4 mx-4 pt-16 md:pt-0 md:my-8 md:mr-8">
        <h1 className="text-2xl font-bold mb-6">Manajemen Persetujuan Akun</h1>
        <Card className="p-4 sm:p-6 md:p-8 w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Nama</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    Tidak ada akun yang menunggu persetujuan
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-2">{user.name}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">
                    <select
                      value={roleMap[user.id]}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Pengurus_IOM">Pengurus IOM</option>
                      <option value="Pewawancara">Pewawancara</option>
                    </select>
                  </td>
                  <td className="py-2 space-x-2">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
                      onClick={() => handleReject(user.id)}
                      disabled={loadingId === user.id}
                    >Tolak</button>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50"
                      onClick={() => handleAccept(user.id)}
                      disabled={loadingId === user.id}
                    >{loadingId === user.id ? "Memproses..." : "Terima"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}