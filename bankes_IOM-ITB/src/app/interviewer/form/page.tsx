"use client";
import SidebarInterviewer from "@/app/components/layout/sidebarinterviewer";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

interface Period {
  period_id: number;
  period: string;
  start_date: Date;
  end_date: Date;
  is_current: boolean;
}

interface Student {
  userId: string;
  text: string;
  Student: {
    nim: string;
    User: {
      id: string;
      name: string | null;
    };
  };
}

export default function Form() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const indexOfLastStudent = currentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const fetchPeriods = async () => {
    try {
      const response = await fetch("/api/periods");
      if (!response.ok) {
        throw new Error("Failed to fetch periods");
      }
      const data: Period[] = await response.json();
      setPeriods(data);
      return data;
    } catch (error) {
      console.error("Error fetching periods:", error);
      return null;
    }
  };

  const fetchStudentsByPeriod = async (periodId: number) => {
    try {
      const response = await fetch("/api/student/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period_id: periodId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
  
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data);
        return data.data;
      } else {
        console.error("Error fetching student:", data.error);
        setStudents([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
      return [];
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch Semua Period
        const fetchedPeriods = await fetchPeriods();
        if (fetchedPeriods) {
          // Cari period yang sedang aktif
          const currentPeriod = fetchedPeriods.find((period) => period.is_current);
          // Set Periode yang dipilih jadi periode sekarang
          setSelectedPeriod(currentPeriod || null);

          if (currentPeriod) {
            // Ambil semua student yang daftar di period sekarang
            const fetchedStudents = await fetchStudentsByPeriod(currentPeriod.period_id);
            if (fetchedStudents && fetchedStudents.length > 0) {
              const defaultStudent = fetchedStudents[0];
              setSelectedStudent(defaultStudent);
              
              
            }
          }
        }
      } catch (error) {
        console.error("Error loading page data:", error);
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = students.filter(
      (student) =>
        (student.Student.User.name?.toLowerCase().includes(term) ?? false) ||
        student.Student.nim.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, students]);
  
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [jalurMasuk, setjalurMasuk] = useState('');
  const [prestasiAkademik, setPrestasiAkademik] = useState('');
  const [kegiatanSosial, setKegiatanSosial] = useState('');
  const [statusTempat, setStatusTempat] = useState('');
  const [otherStatusTempat, setOtherStatusTempat] = useState('');
  const [jarakTempat, setJarakTempat] = useState('');
  const [kirimanUang, setKirimanUang] = useState('');
  const [otherKirimanUang, setOtherKirimanUang] = useState('');
  const [mendapatBeasiswa, setMendapatBeasiswa] = useState('');
  const [otherMendapatBeasiswa, setOtherMendapatBeasiswa] = useState('');
  const [statusRumah, setStatusRumah] = useState('');
  const [sumberPenghasilan, setSumberPenghasilan] = useState('');
  const [slipGaji, setSlipGaji] = useState('');
  const [memilikiPRT, setMemilikiPRT] = useState('');
  const [kesimpulanEkonomi, setKesimpulanEkonomi] = useState('');
  const [kesimpulanKecukupan, setKesimpulanKecukupan] = useState('');
  const [kesimpulanPenggunaan, setKesimpulanPenggunaan] = useState('');
  const [kesimpulanMotivasi, setKesimpulanMotivasi] = useState('');
  const [dukungan, setDukungan] = useState('');
  const [keinginanMembantu, setKeinginanMembantu] = useState('');
  const [keinginanKontribusi, setKeinginanKontribusi] = useState('');
  const [rekomendasi, setRekomendasi] = useState('');

  const [form, setForm] = useState({
    namaPewawancara:"", 
    noHpPewawancara:"",
    namaMahasiswa:"",
    nim:"",
    noHpMahasiswa:"",
    jenisKelamin:"",
    prodiFakultas:"",
    ipk:"",
    permasalahan:"",
    jalurMasukITB:"",
    prestasiAkademik:"",
    kegiatanEkstrakulikuler:"",
    kesimpulanKegiatanEkstrakulikuler:"",
    besarUKTYangSudahDibayar:"",
    asalSMA:"",
    alamatDiBandung:"",
    statusTempatTinggalDiBandung:"",
    biayaKost:"",
    jarakTempatTinggal:"",
    pergiJalan:false,
    pergiSepeda:false,
    pergiOjeg:false,
    pergiAngkot:false,
    pergiOther:"",
    pergiKeKampus:"",
    kirimanUang:"",
    kirimanOrangTuaMakan:false,
    kirimanOrangTuaKost:false,
    kirimanOrangTuaTransport:false,
    kirimanOrangTuaPerkuliahan:false,
    kirimanOrangTuaKesehatan:false,
    apakahMendapatBeasiswa:"",
    apabilaIyaBerapa:"",
    bantuanYangPernahdidapatkan:"",
    jelaskanMasalah:"",
    bantuanYangDiminta:"",
    namaOrangTua:"",
    alamatOrangTua:"",
    noHPOrangTua:"",
    statusRumahOrangTua:"",
    sumberPenghasilanOrangTua:"",
    tuliskanNamaLokasi:"",
    apakahMahasiswaDapat:"",
    penghasilanOrangTua:"",
    jumlahPembayaranListrik:"",
    jumlahPembayaranPBB:"",
    tanggunganKeluarga:"",
    apakahDiRumah:"",
    kesimpulanKemampuanEkonomi:"",
    kesimpulanKecukupanBiayaHidup:"",
    kesimpulanPenggunaanDana:"",
    kesimpulanMotivasiPribadi:"",
    dukunganDariLingkungan:"",
    keinginanUntukMembantu:"",
    keinginanUntukBerkontribusi:"",
    tuliskanHalHalYangDidapat:"",
    rekomendasiUntukMendapat:"",
    besaranBeasiswa:"",
    rekomendasiUntukJenis:"",
    rekomendasiBiaya:"",
    rekomendasiKesehatan:"",
    rekomendasiOrangtua:"",
    rekomendasiOther:"",
    pertanyaanLainnya:"",
  });

  const handleCheckboxChange = (field: keyof typeof form) => {
    setForm(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({
    ...form,
    })
    // console.log(body,);
    try {
      // Send to API
      const response = await fetch("/api/form/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          period_id: selectedPeriod?.id,
          nim: selectedStudent?.Student.nim,
          formData: body,
        }),
      })

      if (response.ok) {
        // Update the student in the local state

        toast.success("Form data saved successfully")
      } else {
        throw new Error("Failed to save form data")
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form data");
    } finally {

    }
  };

  const handlePeriodChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setLoading(true);
      const selectedId = event.target.value;
      const selected = periods.find((period) => period.period_id === parseInt(selectedId, 10));
      setSelectedPeriod(selected || null);
      if (selected) {
        console.log("period",selected.period_id);
        const fileResponse = await fetch("/api/student/form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ period_id: selected?.period_id }),
        });
        if (!fileResponse.ok) {
          throw new Error("Failed to fetch student files");
        }
        const fileData = await fileResponse.json();
        if (fileData.success) {
          console.log(fileData.data,);
          setStudents(fileData.data);
          console.log(students,);
        } else {
          console.error("Error fetching student files:", fileData.error);
        }
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Update the handleStudentClick function to fetch the status record as well
  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const fileResponse = await fetch("/api/form/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          period_id: selectedPeriod?.id ,
          user_id: student.userId
        }),
      });

      if (!fileResponse.ok) {
        throw new Error("Failed to fetch student files");
      }
      const fileData = await fileResponse.json();
      if (fileData.success) {
        const parsedData = JSON.parse(fileData.data.text);
        setForm(parsedData);
        setJenisKelamin(parsedData.jenisKelamin);
        setjalurMasuk(parsedData.jalurMasukITB);
        setPrestasiAkademik(parsedData.prestasiAkademik);
        setKegiatanSosial(parsedData.kegiatanEkstrakulikuler);
        if(['Kost','Menumpang Saudara','Di rumah orangtua'].includes(parsedData.statusTempatTinggalDiBandung)){
          setStatusTempat(parsedData.statusTempatTinggalDiBandung);
        } else {
          setStatusTempat("Lainnya :");
          setOtherStatusTempat(parsedData.statusTempatTinggalDiBandung);
        }
        setJarakTempat(parsedData.jarakTempatTinggal);
        if(['Tidak mendapat kiriman','Tidak tentu','Diatas Rp.1.250.000','Antara Rp.1.000.001 - Rp.1.250.000','Antara Rp.750.001 - Rp.1.000.000','Antara Rp.500.001 - Rp.750.000','Antara Rp.300.001 - Rp.500.000','Dibawah Rp.300.000'].includes(parsedData.kirimanUang)){
          setKirimanUang(parsedData.kirimanUang);
        } else {
          setKirimanUang('Lainnya :');
          setOtherKirimanUang(parsedData.kirimanUang);
        }
        if(['Ya','Tidak'].includes(parsedData.apakahMendapatBeasiswa)){
          setMendapatBeasiswa(parsedData.apakahMendapatBeasiswa);
        } else {
          setMendapatBeasiswa('Lainnya :');
          setOtherMendapatBeasiswa(parsedData.apakahMendapatBeasiswa);
        }
        setStatusRumah(parsedData.statusRumahOrangTua);
        setSumberPenghasilan(parsedData.sumberPenghasilanOrangTua);
        setSlipGaji(parsedData.apakahMahasiswaDapat);
        setMemilikiPRT(parsedData.apakahDiRumah);
        setKesimpulanEkonomi(parsedData.kesimpulanKemampuanEkonomi);
        setKesimpulanKecukupan(parsedData.kesimpulanKecukupanBiayaHidup);
        setKesimpulanPenggunaan(parsedData.kesimpulanPenggunaanDana);
        setKesimpulanMotivasi(parsedData.kesimpulanMotivasiPribadi);
        setDukungan(parsedData.dukunganDariLingkungan);
        setKeinginanMembantu(parsedData.keinginanUntukMembantu);
        setKeinginanKontribusi(parsedData.keinginanUntukBerkontribusi);
        setRekomendasi(parsedData.rekomendasiUntukMendapat)
      } else {
        console.error("Error fetching student files:", fileData.error);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };


  return (
      <div className="flex min-h-screen bg-gray-100">
        <Toaster position="bottom-right" richColors />
        <div className="w-0 md:w-64 shrink-0">
          <SidebarInterviewer activeTab="form" />
        </div>
        <div className="flex-1 min-w-0 my-4 mx-4 pt-16 md:pt-0 md:my-8 md:mr-8">
          <h1 className="text-2xl font-bold mb-6">Form Interview Mahasiswa</h1>
          <Card className="p-4 sm:p-6 md:p-8 w-full">
            {loading ? (
                <p className="text-lg">Loading...</p>
            ) : (
                <>
                  <div className="w-full flex gap-3">
                    <select
                      className="block w-[300px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={selectedPeriod?.period_id || ""}
                      onChange={handlePeriodChange}
                    >
                      <option value="">Pilih Periode</option>
                      {periods.map((period) => (
                        <option key={period.period_id} value={period.period_id}>
                          {period.period} {period.is_current ? "(Current)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 w-[300px]">
                    <label htmlFor="search" className="text-sm font-medium mb-1">
                      Cari Nama/NIM Mahasiswa:
                    </label>
                    <input
                      id="search"
                      type="text"
                      placeholder="Masukkan Nama atau NIM"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex w-full gap-6 justify-between mt-6">
                    {selectedPeriod && (
                      <div className="flex flex-col gap-4 w-[450px]">
                        <div className="max-w-full border border-gray-300 rounded-md">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-2 py-4 text-left text-xs font-medium uppercase tracking-wider"
                                >
                                  NIM
                                </th>
                                <th
                                  scope="col"
                                  className="px-2 py-4 text-left text-xs font-medium uppercase tracking-wider"
                                >
                                  Nama
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {students.map((student, index) => {
                                const isSelected = student.userId === selectedStudent?.userId;

                                return (
                                  <tr
                                    key={index}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleStudentClick(student)}
                                    className={`cursor-pointer ${
                                      isSelected ? "bg-main" : "bg-white hover:bg-gray-100"
                                    }`}
                                  >
                                    <td className="px-2 py-4 text-sm text-gray-900">
                                      <div className="line-clamp-2 overflow-hidden">
                                        {isSelected ? (
                                          <span className="text-white">{student.Student.nim}</span>
                                        ) : (
                                          student.Student.nim
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-2 py-4 text-sm text-gray-900">
                                      <div className="line-clamp-2 overflow-hidden">
                                        {isSelected ? (
                                          <span className="text-white">{student.Student.User.name ?? "-"}</span>
                                        ) : (
                                          student.Student.User.name ?? "-"
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                          </table>
                        </div>
                        <div className="flex w-full justify-between items-center gap-2 mt-2">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-2 py-2 rounded border-2 hover:bg-gray-200 text-sm disabled:opacity-50"
                          >
                            Previous
                          </button>

                          <div className="flex gap-1">
                            {Array.from({ length: 3 }, (_, i) => {
                              let startPage = Math.max(1, currentPage - 1);
                              if (currentPage === totalPages) startPage = totalPages - 2;
                              if (currentPage === 1) startPage = 1;

                              const page = startPage + i;
                              if (page > totalPages) return null;

                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-2 py-2 text-sm rounded ${
                                    currentPage === page
                                      ? "bg-main text-white"
                                      : "border-2 hover:bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-2 py-2 rounded border-2 hover:bg-gray-200 text-sm disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="w-full p-2 border border-gray-300 rounded-md">
                      <form onSubmit={handleSubmit} className="space-y-6 p-6 mx-auto">

                        <div>
                          <label className="block font-medium">Nama Pewawancara</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.namaPewawancara}
                            onChange={e => setForm({ ...form, namaPewawancara: e.target.value })}
                            placeholder="Nama Anda"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Nomor HP Pewawancara</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.noHpPewawancara}
                            onChange={e => setForm({ ...form, noHpPewawancara: e.target.value })}
                            placeholder="Nomor HP Anda"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Nama Mahasiswa</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.namaMahasiswa}
                            onChange={e => setForm({ ...form, namaMahasiswa: e.target.value })}
                            placeholder="Nama Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">NIM</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.nim}
                            onChange={e => setForm({ ...form, nim: e.target.value })}
                            placeholder="NIM Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">No HP mahasiswa</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.noHpMahasiswa}
                            onChange={e => setForm({ ...form, noHpMahasiswa: e.target.value })}
                            placeholder="Nomor HP Mahasiswa"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Jenis Kelamin yang diwawancara</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jeniskelamin"
                                value="p"
                                checked={jenisKelamin === 'p'}
                                onChange={() => {
                                  setJenisKelamin('p');
                                  setForm({ ...form, jenisKelamin: 'p'})
                                }}
                              />
                              <span>Perempuan</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jeniskelamin"
                                value="l"
                                checked={jenisKelamin === 'l'}
                                onChange={() => {
                                  setJenisKelamin('l');
                                  setForm({ ...form, jenisKelamin: 'l'})
                                }}
                              />
                              <span>Laki laki</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium">Prodi/Fakultas</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.prodiFakultas}
                            onChange={e => setForm({ ...form, prodiFakultas: e.target.value })}
                            placeholder="Prodi / Fakultas Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Nilai IPK</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.ipk}
                            onChange={e => setForm({ ...form, ipk: e.target.value })}
                            placeholder="Nilai IPK Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Permasalahan yang dihadapi selama kuliah</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.permasalahan}
                            onChange={e => setForm({ ...form, permasalahan: e.target.value })}
                            placeholder="Permasalahan Mahasiswa"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Jalur masuk ITB</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jalurmasuk"
                                value="SNBP"
                                checked={jalurMasuk === 'SNBP'}
                                onChange={() => {
                                  setjalurMasuk('SNBP');
                                  setForm({ ...form, jalurMasukITB: 'SNBP'})
                                }}
                              />
                              <span>SNBP</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jalurmasuk"
                                value="SNBT"
                                checked={jalurMasuk === 'SNBT'}
                                onChange={() => {
                                  setjalurMasuk('SNBT');
                                  setForm({ ...form, jalurMasukITB: 'SNBT'})
                                }}
                              />
                              <span>SNBT</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jalurmasuk"
                                value="SNBP Peminatan"
                                checked={jalurMasuk === 'SNBP Peminatan'}
                                onChange={() => {
                                  setjalurMasuk('SNBP Peminatan');
                                  setForm({ ...form, jalurMasukITB: 'SNBP Peminatan'})
                                }}
                              />
                              <span>SNBP Peminatan</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jalurmasuk"
                                value="SM"
                                checked={jalurMasuk === 'SM'}
                                onChange={() => {setjalurMasuk('SM');
                                  setForm({ ...form, jalurMasukITB: 'SM'})
                                }}
                              />
                              <span>SM</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jalurmasuk"
                                value="IUP"
                                checked={jalurMasuk === 'IUP'}
                                onChange={() => {setjalurMasuk('IUP');
                                  setForm({ ...form, jalurMasukITB: 'IUP'})
                                }}
                              />
                              <span>IUP</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Dari hasil wawancara bagaimana prestasi akademik menurut anda</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="prestasiakademik"
                                value="1"
                                checked={prestasiAkademik === '1'}
                                onChange={() => {setPrestasiAkademik('1');
                                  setForm({ ...form, prestasiAkademik: '1'})
                                }}
                              />
                              <span>1</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="prestasiakademik"
                                value="2"
                                checked={prestasiAkademik === '2'}
                                onChange={() => {setPrestasiAkademik('2');
                                  setForm({ ...form, prestasiAkademik: '2'})
                                }}
                              />
                              <span>2</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="prestasiakademik"
                                value="3"
                                checked={prestasiAkademik === '3'}
                                onChange={() => {setPrestasiAkademik('3');
                                  setForm({ ...form, prestasiAkademik: '3'})
                                }}
                              />
                              <span>3</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="prestasiakademik"
                                value="4"
                                checked={prestasiAkademik === '4'}
                                onChange={() => {setPrestasiAkademik('4');
                                  setForm({ ...form, prestasiAkademik: '4'})
                                }}
                              />
                              <span>4</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="prestasiakademik"
                                value="5"
                                checked={prestasiAkademik === '5'}
                                onChange={() => {setPrestasiAkademik('5');
                                  setForm({ ...form, prestasiAkademik: '5'})
                                }}
                              />
                              <span>5</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium">Kegiatan dan aktivitas ekstrakurikuler atau sosial yang diikuti</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.kegiatanEkstrakulikuler}
                            onChange={e => setForm({ ...form, kegiatanEkstrakulikuler: e.target.value })}
                            placeholder="Kegiatan Mahasiswa"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Kesimpulan anda mengenai kegiatan dan aktivitas ekstrakurikuler dan sosial mahasiswa</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kegiatansosial"
                                value="1"
                                checked={kegiatanSosial === '1'}
                                onChange={() => {setKegiatanSosial('1');
                                  setForm({ ...form, kegiatanEkstrakulikuler: '1'})
                                }}
                              />
                              <span>1</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kegiatansosial"
                                value="2"
                                checked={kegiatanSosial === '2'}
                                onChange={() => {setKegiatanSosial('2');
                                  setForm({ ...form, kegiatanEkstrakulikuler: '2'})
                                }}
                              />
                              <span>2</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kegiatansosial"
                                value="3"
                                checked={kegiatanSosial === '3'}
                                onChange={() => {setKegiatanSosial('3');
                                  setForm({ ...form, kegiatanEkstrakulikuler: '3'})
                                }}
                              />
                              <span>3</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kegiatansosial"
                                value="4"
                                checked={kegiatanSosial === '4'}
                                onChange={() => {setKegiatanSosial('4');
                                  setForm({ ...form, kegiatanEkstrakulikuler: '4'})
                                }}
                              />
                              <span>4</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kegiatansosial"
                                value="5"
                                checked={kegiatanSosial === '5'}
                                onChange={() => {setKegiatanSosial('5');
                                  setForm({ ...form, kegiatanEkstrakulikuler: '5'})
                                }}
                              />
                              <span>5</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium">Besar UKT yang sudah dibayarkan</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.besarUKTYangSudahDibayar}
                            onChange={e => setForm({ ...form, besarUKTYangSudahDibayar: e.target.value })}
                            placeholder="Besar UKT Yang Sudah Dibayar Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Asal SMA</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.asalSMA}
                            onChange={e => setForm({ ...form, asalSMA: e.target.value })}
                            placeholder="Asal SMA Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Alamat tempat tinggal di Bandung</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.alamatDiBandung}
                            onChange={e => setForm({ ...form, alamatDiBandung: e.target.value })}
                            placeholder="Alamat Mahasiswa di Bandung"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Status tempat tinggal di Bandung</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="tempattinggal"
                                value="Kost"
                                checked={statusTempat === 'Kost'}
                                onChange={() => {setStatusTempat('Kost');
                                  setForm({ ...form, statusTempatTinggalDiBandung: 'Kost'})
                                }}
                              />
                              <span>Kost</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="tempattinggal"
                                value="Menumpang Saudara"
                                checked={statusTempat === 'Menumpang Saudara'}
                                onChange={() => {setStatusTempat('Menumpang Saudara');
                                  setForm({ ...form, statusTempatTinggalDiBandung: 'Menumpang Saudara'})}}
                              />
                              <span>Menumpang Saudara</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="tempattinggal"
                                value="Di rumah orangtua"
                                checked={statusTempat === 'Di rumah orangtua'}
                                onChange={() => {setStatusTempat('Di rumah orangtua');
                                  setForm({ ...form, statusTempatTinggalDiBandung: 'Di rumah orangtua'})}}
                              />
                              <span>Di rumah orangtua</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="tempattinggal"
                                value="Lainnya :"
                                checked={statusTempat === 'Lainnya :'}
                                onChange={() => setStatusTempat('Lainnya :')}
                              />
                              <span>Lainnya :</span>
                            </label>
                            {statusTempat === 'Lainnya :' && (
                              <input
                                type="text"
                                className="ml-6 border rounded p-2 w-full"
                                placeholder="Tulis jawaban lain..."
                                value={otherStatusTempat}
                                onChange={(e) => {setOtherStatusTempat(e.target.value);
                                  setForm({ ...form, statusTempatTinggalDiBandung: e.target.value})}}
                              />
                            )}
                          </div>
                        </div>
                  
                        <div>
                          <label className="block font-medium">Apabila kost berapakah biaya kost yang dibayarkan per bulan/tahun bersama biaya listrik dan air serta cucian /laundry bila ada</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.biayaKost}
                            onChange={e => setForm({ ...form, biayaKost: e.target.value })}
                            placeholder="Biaya per bulan/tahun"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Jarak tempat tinggal ke ITB</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jaraktempat"
                                value="Dibawah 1 Km"
                                checked={jarakTempat === 'Dibawah 1 Km'}
                                onChange={() => {setJarakTempat('Dibawah 1 Km');
                                  setForm({ ...form, jarakTempatTinggal: 'Dibawah 1 Km'})
                                }}
                              />
                              <span>Dibawah 1 Km</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jaraktempat"
                                value="Antara 1 KM - 3 KM"
                                checked={jarakTempat === 'Antara 1 KM - 3 KM'}
                                onChange={() => {setJarakTempat('Antara 1 KM - 3 KM');
                                  setForm({ ...form, jarakTempatTinggal: 'Antara 1 KM - 3 KM'})}}
                              />
                              <span>Antara 1 KM - 3 KM</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jaraktempat"
                                value="Antara 3 KM - 5 KM"
                                checked={jarakTempat === 'Antara 3 KM - 5 KM'}
                                onChange={() => {setJarakTempat('Antara 3 KM - 5 KM');
                                  setForm({ ...form, jarakTempatTinggal: 'Antara 3 KM - 5 KM'})}}
                              />
                              <span>Antara 3 KM - 5 KM</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="jaraktempat"
                                value="Diatas 5 KM"
                                checked={jarakTempat === 'Diatas 5 KM'}
                                onChange={() => {setJarakTempat('Diatas 5 KM');
                                  setForm({ ...form, jarakTempatTinggal: 'Diatas 5 KM'})}}
                              />
                              <span>Diatas 5 KM</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Pergi ke kampus menggunakan apa</legend>
                          {[
                            ['pergiJalan', 'Jalan kaki'],
                            ['pergiSepeda', 'Sepeda'],
                            ['pergiOjeg', 'Ojeg online'],
                            ['pergiAngkot', 'Angkot/bus'],
                          ].map(([key, label]) => (
                            <div key={key} className="mb-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={form[key as keyof typeof form] as boolean}
                                  onChange={() => handleCheckboxChange(key as keyof typeof form)}
                                  className="form-checkbox"
                                />
                                <span>{label}</span>
                              </label>
                            </div>
                          ))}
                          <div className="flex align-middle space-x-2">
                            <span className="self-center">Lainnya:</span>
                            <input
                              type="text"
                              className="mt-1 w-full border p-2 rounded"
                              value={form.pergiOther}
                              onChange={e => setForm({ ...form, pergiOther: e.target.value })}
                              placeholder="Lainnya"
                            />
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Kiriman uang dari orangtua setiap bulan</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kirimanuang"
                                value="Dibawah Rp.300.000"
                                checked={kirimanUang === 'Dibawah Rp.300.000'}
                                onChange={() => {setKirimanUang('Dibawah Rp.300.000');
                                  setForm({ ...form, kirimanUang: 'Dibawah Rp.300.000'})
                                }}
                              />
                              <span>Dibawah Rp.300.000</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kirimanuang"
                                value="Antara Rp.300.001 - Rp.500.000"
                                checked={kirimanUang === 'Antara Rp.300.001 - Rp.500.000'}
                                onChange={() => {setKirimanUang('Antara Rp.300.001 - Rp.500.000');
                                  setForm({ ...form, kirimanUang: 'Antara Rp.300.001 - Rp.500.000'})}}
                              />
                              <span>Antara Rp.300.001 - Rp.500.000</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kirimanuang"
                                value="Antara Rp.500.001 - Rp.750.000"
                                checked={kirimanUang === 'Antara Rp.500.001 - Rp.750.000'}
                                onChange={() => {setKirimanUang('Antara Rp.500.001 - Rp.750.000');
                                  setForm({ ...form, kirimanUang: 'Antara Rp.500.001 - Rp.750.000'})}}
                              />
                              <span>Antara Rp.500.001 - Rp.750.000</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kirimanuang"
                                value="Antara Rp.750.001 - Rp.1.000.000"
                                checked={kirimanUang === 'Antara Rp.750.001 - Rp.1.000.000'}
                                onChange={() => {setKirimanUang('Antara Rp.750.001 - Rp.1.000.000');
                                  setForm({ ...form, kirimanUang: 'Antara Rp.750.001 - Rp.1.000.000'})}}
                              />
                              <span>Antara Rp.750.001 - Rp.1.000.000</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kirimanuang"
                                value="Antara Rp.1.000.001 - Rp.1.250.000"
                                checked={kirimanUang === 'Antara Rp.1.000.001 - Rp.1.250.000'}
                                onChange={() => {setKirimanUang('Antara Rp.1.000.001 - Rp.1.250.000');
                                  setForm({ ...form, kirimanUang: 'Antara Rp.1.000.001 - Rp.1.250.000'})}}
                              />
                              <span>Antara Rp.1.000.001 - Rp.1.250.000</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kirimanuang"
                                value="Diatas Rp.1.250.000"
                                checked={kirimanUang === 'Diatas Rp.1.250.000'}
                                onChange={() => {setKirimanUang('Diatas Rp.1.250.000');
                                  setForm({ ...form, kirimanUang: 'Diatas Rp.1.250.000'})}}
                              />
                              <span>Diatas Rp.1.250.000</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kirimanuang"
                                value="Tidak tentu"
                                checked={kirimanUang === 'Tidak tentu'}
                                onChange={() => {setKirimanUang('Tidak tentu');
                                  setForm({ ...form, kirimanUang: 'Tidak tentu'})}}
                              />
                              <span>Tidak tentu</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kirimanuang"
                                value="Tidak mendapat kiriman"
                                checked={kirimanUang === 'Tidak mendapat kiriman'}
                                onChange={() => {setKirimanUang('Tidak mendapat kiriman');
                                  setForm({ ...form, kirimanUang: 'Tidak mendapat kiriman'})}}
                              />
                              <span>Tidak mendapat kiriman</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kirimanuang"
                                value="Lainnya :"
                                checked={kirimanUang === 'Lainnya :'}
                                onChange={() => setKirimanUang('Lainnya :')}
                              />
                              <span>Lainnya :</span>
                            </label>
                            {kirimanUang === 'Lainnya :' && (
                              <input
                                type="text"
                                className="ml-6 border rounded p-2 w-full"
                                placeholder="Tulis jawaban lain..."
                                value={otherKirimanUang}
                                onChange={(e) => {setOtherKirimanUang(e.target.value);
                                  setForm({ ...form, kirimanUang: e.target.value})}}
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Kiriman orangtua mencakup untuk apa saja ?</legend>
                          {[
                            ['kirimanOrangTuaMakan', 'Makan sehari hari'],
                            ['kirimanOrangTuaKost', 'Kost /sewa kamar'],
                            ['kirimanOrangTuaTransport', 'Transportasi ke kampus /bensin'],
                            ['kirimanOrangTuaPerkuliahan', 'Kebutuhan perkuliahan (alat tulis, ongkos kerja kelompok dll)'],
                            ['kirimanOrangTuaKesehatan', 'Biaya kesehatan (Ke dr, beli obat) bila sakit'],
                          ].map(([key, label]) => (
                            <div key={key} className="mb-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={form[key as keyof typeof form] as boolean}
                                  onChange={() => handleCheckboxChange(key as keyof typeof form)}
                                  className="form-checkbox"
                                />
                                <span>{label}</span>
                              </label>
                            </div>
                          ))}
                        </div>

                        <div>
                          <legend className="font-medium">Apakah mendapat beasiswa semester ini?</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="apakahMendapatBeasiswa"
                                value="Ya"
                                checked={mendapatBeasiswa === 'Ya'}
                                onChange={() => {setMendapatBeasiswa('Ya');
                                  setForm({ ...form, apakahMendapatBeasiswa: 'Ya'})
                                }}
                              />
                              <span>Ya</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="apakahMendapatBeasiswa"
                                value="Tidak"
                                checked={mendapatBeasiswa === 'Tidak'}
                                onChange={() => {setMendapatBeasiswa('Tidak');
                                  setForm({ ...form, apakahMendapatBeasiswa: 'Tidak'})
                                }}
                              />
                              <span>Tidak</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="apakahMendapatBeasiswa"
                                value="Lainnya :"
                                checked={mendapatBeasiswa === 'Lainnya :'}
                                onChange={() => setMendapatBeasiswa('Lainnya :')}
                              />
                              <span>Lainnya :</span>
                            </label>
                            {mendapatBeasiswa === 'Lainnya :' && (
                              <input
                                type="text"
                                className="ml-6 border rounded p-2 w-full"
                                placeholder="Tulis jawaban lain..."
                                value={otherMendapatBeasiswa}
                                onChange={(e) => {setOtherMendapatBeasiswa(e.target.value)
                                  setForm({ ...form, apakahMendapatBeasiswa: e.target.value})}}
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium">Apabila iya, berapa besarannya dan sumber pemberi beasiswa</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.apabilaIyaBerapa}
                            onChange={e => setForm({ ...form, apabilaIyaBerapa: e.target.value })}
                            placeholder="Besaran dan Sumber Beasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Bantuan yang pernah didapatkan dari IOM ITB</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.bantuanYangPernahdidapatkan}
                            onChange={e => setForm({ ...form, bantuanYangPernahdidapatkan: e.target.value })}
                            placeholder="Bantuan yang Pernah Didapat"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Jelaskan masalah yang dihadapi sehingga minta bantuan SPP dan lain lain</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.jelaskanMasalah}
                            onChange={e => setForm({ ...form, jelaskanMasalah: e.target.value })}
                            placeholder="Masalah Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Bantuan yang diminta (jenis, besaran), apabila mahasiswa mengajukan beasiswa SPP maka mintalah mahasiswa mengajukan penangguhan terlebih dahulu</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.bantuanYangDiminta}
                            onChange={e => setForm({ ...form, bantuanYangDiminta: e.target.value })}
                            placeholder="Bantuan yang Diminta"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Nama orangtua</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.namaOrangTua}
                            onChange={e => setForm({ ...form, namaOrangTua: e.target.value })}
                            placeholder="Nama orangtua Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Alamat orangtua</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.alamatOrangTua}
                            onChange={e => setForm({ ...form, alamatOrangTua: e.target.value })}
                            placeholder="Alamat orangtua Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">No HP Orangtua</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.noHPOrangTua}
                            onChange={e => setForm({ ...form, noHPOrangTua: e.target.value })}
                            placeholder="Nomor HP Orangtua Mahasiswa"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Status rumah orangtua</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="statusrumah"
                                value="Rumah sendiri di atas tanah bersertifikat resmi"
                                checked={statusRumah === 'Rumah sendiri di atas tanah bersertifikat resmi'}
                                onChange={() => {setStatusRumah('Rumah sendiri di atas tanah bersertifikat resmi');
                                  setForm({ ...form, statusRumahOrangTua: 'Rumah sendiri di atas tanah bersertifikat resmi'})
                                }}
                              />
                              <span>Rumah sendiri di atas tanah bersertifikat resmi</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="statusrumah"
                                value="Rumah sendiri di atas tanah sewaan negara/sewaan orang lain"
                                checked={statusRumah === 'Rumah sendiri di atas tanah sewaan negara/sewaan orang lain'}
                                onChange={() => {setStatusRumah('Rumah sendiri di atas tanah sewaan negara/sewaan orang lain');
                                  setForm({ ...form, statusRumahOrangTua: 'Rumah sendiri di atas tanah sewaan negara/sewaan orang lain'})}}
                              />
                              <span>Rumah sendiri di atas tanah sewaan negara/sewaan orang lain</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="statusrumah"
                                value="Rumah pinjaman keluarga"
                                checked={statusRumah === 'Rumah pinjaman keluarga'}
                                onChange={() =>{ setStatusRumah('Rumah pinjaman keluarga');
                                  setForm({ ...form, statusRumahOrangTua: 'Rumah pinjaman keluarga'})}}
                              />
                              <span>Rumah pinjaman keluarga</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="statusrumah"
                                value="Rumah menumpang kepada saudara /kerabat/teman"
                                checked={statusRumah === 'Rumah menumpang kepada saudara /kerabat/teman'}
                                onChange={() => {setStatusRumah('Rumah menumpang kepada saudara /kerabat/teman');
                                  setForm({ ...form, statusRumahOrangTua: 'Rumah menumpang kepada saudara /kerabat/teman'})}}
                              />
                              <span>Rumah menumpang kepada saudara /kerabat/teman</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="statusrumah"
                                value="Rumah sewaan (kontrakan)"
                                checked={statusRumah === 'Rumah sewaan (kontrakan)'}
                                onChange={() => {setStatusRumah('Rumah sewaan (kontrakan)');
                                  setForm({ ...form, statusRumahOrangTua: 'Rumah sewaan (kontrakan)'})}}
                              />
                              <span>Rumah sewaan (kontrakan)</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Sumber penghasilan orangtua (bekerja adalah bekerja formal di instansi swasta atau negeri, wiraswasta atau pedagang, buruh dll)</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="sumberpenghasilan"
                                value="Ayah ibu bekerja"
                                checked={sumberPenghasilan === 'Ayah ibu bekerja'}
                                onChange={() => {setSumberPenghasilan('Ayah ibu bekerja');
                                  setForm({ ...form, sumberPenghasilanOrangTua: 'Ayah ibu bekerja'})
                                }}
                              />
                              <span>Ayah ibu bekerja</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="sumberpenghasilan"
                                value="Ayah ibu tidak bekerja"
                                checked={sumberPenghasilan === 'Ayah ibu tidak bekerja'}
                                onChange={() => {setSumberPenghasilan('Ayah ibu tidak bekerja');
                                  setForm({ ...form, sumberPenghasilanOrangTua: 'Ayah ibu tidak bekerja'})}}
                              />
                              <span>Ayah ibu tidak bekerja</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="sumberpenghasilan"
                                value="Ayah bekerja, ibu tidak bekerja"
                                checked={sumberPenghasilan === 'Ayah bekerja, ibu tidak bekerja'}
                                onChange={() => {setSumberPenghasilan('Ayah bekerja, ibu tidak bekerja');
                                  setForm({ ...form, sumberPenghasilanOrangTua: 'Ayah bekerja, ibu tidak bekerja'})}}
                              />
                              <span>Ayah bekerja, ibu tidak bekerja</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="sumberpenghasilan"
                                value="Ayah tidak bekerja, ibu bekerja"
                                checked={sumberPenghasilan === 'Ayah tidak bekerja, ibu bekerja'}
                                onChange={() => {setSumberPenghasilan('Ayah tidak bekerja, ibu bekerja');
                                  setForm({ ...form, sumberPenghasilanOrangTua: 'Ayah tidak bekerja, ibu bekerja'})}}
                              />
                              <span>Ayah tidak bekerja, ibu bekerja</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium">Tuliskan nama lokasi tempat bekerja orangtua (nama kantor, nama pasar, warung, dll)</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.tuliskanNamaLokasi}
                            onChange={e => setForm({ ...form, tuliskanNamaLokasi: e.target.value })}
                            placeholder="Lokasi Bekerja Orangtua Mahasiswa"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Apakah mahasiswa dapat menunjukkan slip gaji orangtua?</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="slipgaji"
                                value="Ya"
                                checked={slipGaji === 'Ya'}
                                onChange={() => {setSlipGaji('Ya');
                                  setForm({ ...form, apakahMahasiswaDapat: 'Ya' })
                                }}
                              />
                              <span>Ya</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="slipgaji"
                                value="Tidak"
                                checked={slipGaji === 'Tidak'}
                                onChange={() => {setSlipGaji('Tidak');
                                  setForm({ ...form, apakahMahasiswaDapat: 'Tidak' })}}
                              />
                              <span>Tidak</span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block font-medium">Penghasilan orangtua dalam sebulan (Digabungkan suami istri)</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.penghasilanOrangTua}
                            onChange={e => setForm({ ...form, penghasilanOrangTua: e.target.value })}
                            placeholder="Penghasilan Orangtuan Mahasiswa"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Jumlah pembayaran Listrik setiap bulan</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.jumlahPembayaranListrik}
                            onChange={e => setForm({ ...form, jumlahPembayaranListrik: e.target.value })}
                            placeholder="Pembayaran Listrik"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Jumlah pembayaran PBB setiap tahun</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.jumlahPembayaranPBB}
                            onChange={e => setForm({ ...form, jumlahPembayaranPBB: e.target.value })}
                            placeholder="Pembayaran PBB"
                          />
                        </div>

                        <div>
                          <label className="block font-medium">Tanggungan keluarga ayah ibu (jumlah anak/orang serumah yang masih dibiayai orangtua)</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.tanggunganKeluarga}
                            onChange={e => setForm({ ...form, tanggunganKeluarga: e.target.value })}
                            placeholder="Tanggungan Orangtua Mahasiswa"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Apakah di rumah memiliki PRT</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="prt"
                                value="Ya"
                                checked={memilikiPRT === 'Ya'}
                                onChange={() => {setMemilikiPRT('Ya');
                                  setForm({ ...form, apakahDiRumah: 'Ya'})
                                }}
                              />
                              <span>Ya</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="prt"
                                value="Tidak"
                                checked={memilikiPRT === 'Tidak'}
                                onChange={() => {setMemilikiPRT('Tidak');
                                  setForm({ ...form, apakahDiRumah: 'Tidak'})}}
                              />
                              <span>Tidak</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="prt"
                                value="Dipanggil sewaktu waktu saja"
                                checked={memilikiPRT === 'Dipanggil sewaktu waktu saja'}
                                onChange={() => {setMemilikiPRT('Dipanggil sewaktu waktu saja');
                                  setForm({ ...form, apakahDiRumah: 'Dipanggil sewaktu waktu saja'})}}
                              />
                              <span>Dipanggil sewaktu waktu saja</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Kesimpulan anda mengenai kemampuan ekonomi kerluarga</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanekonomi"
                                value="1"
                                checked={kesimpulanEkonomi === '1'}
                                onChange={() => {setKesimpulanEkonomi('1');
                                  setForm({ ...form, kesimpulanKemampuanEkonomi: '1'})
                                }}
                              />
                              <span>1</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanekonomi"
                                value="2"
                                checked={kesimpulanEkonomi === '2'}
                                onChange={() => {setKesimpulanEkonomi('2');
                                  setForm({ ...form, kesimpulanKemampuanEkonomi: '2'})
                                }}
                              />
                              <span>2</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanekonomi"
                                value="3"
                                checked={kesimpulanEkonomi === '3'}
                                onChange={() => {setKesimpulanEkonomi('3');
                                  setForm({ ...form, kesimpulanKemampuanEkonomi: '3'})
                                }}
                              />
                              <span>3</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanekonomi"
                                value="4"
                                checked={kesimpulanEkonomi === '4'}
                                onChange={() => {setKesimpulanEkonomi('4');
                                  setForm({ ...form, kesimpulanKemampuanEkonomi: '4'})
                                }}
                              />
                              <span>4</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanekonomi"
                                value="5"
                                checked={kesimpulanEkonomi === '5'}
                                onChange={() => {setKesimpulanEkonomi('5');
                                  setForm({ ...form, kesimpulanKemampuanEkonomi: '5'})
                                }}
                              />
                              <span>5</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Kesimpulan anda mengenai kecukupan biaya hidup</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulankecukupan"
                                value="1"
                                checked={kesimpulanKecukupan === '1'}
                                onChange={() => {setKesimpulanKecukupan('1');
                                  setForm({...form, kesimpulanKecukupanBiayaHidup: '1'})
                                }}
                              />
                              <span>1</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulankecukupan"
                                value="2"
                                checked={kesimpulanKecukupan === '2'}
                                onChange={() => {setKesimpulanKecukupan('2');
                                  setForm({...form, kesimpulanKecukupanBiayaHidup: '2'})
                                }}
                              />
                              <span>2</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulankecukupan"
                                value="3"
                                checked={kesimpulanKecukupan === '3'}
                                onChange={() => {setKesimpulanKecukupan('3');
                                  setForm({...form, kesimpulanKecukupanBiayaHidup: '3'})
                                }}
                              />
                              <span>3</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulankecukupan"
                                value="4"
                                checked={kesimpulanKecukupan === '4'}
                                onChange={() => {setKesimpulanKecukupan('4');
                                  setForm({...form, kesimpulanKecukupanBiayaHidup: '4'})
                                }}
                              />
                              <span>4</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulankecukupan"
                                value="5"
                                checked={kesimpulanKecukupan === '5'}
                                onChange={() => {setKesimpulanKecukupan('5');
                                  setForm({...form, kesimpulanKecukupanBiayaHidup: '5'})
                                }}
                              />
                              <span>5</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Kesimpulan anda mengenai penggunaan dana beasiswa (biaya kuliah vs biaya hidup)</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanpenggunaan"
                                value="Beasiswa sepenuhnya akan digunakan untuk biaya kuliah dan biaya hidup"
                                checked={kesimpulanPenggunaan === 'Beasiswa sepenuhnya akan digunakan untuk biaya kuliah dan biaya hidup'}
                                onChange={() => {setKesimpulanPenggunaan('Beasiswa sepenuhnya akan digunakan untuk biaya kuliah dan biaya hidup');
                                  setForm({...form, kesimpulanPenggunaanDana: 'Beasiswa sepenuhnya akan digunakan untuk biaya kuliah dan biaya hidup'})
                                }}
                              />
                              <span>Beasiswa sepenuhnya akan digunakan untuk biaya kuliah dan biaya hidup</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanpenggunaan"
                                value="Beasiswa dibutuhkan untuk biaya kuliah"
                                checked={kesimpulanPenggunaan === 'Beasiswa dibutuhkan untuk biaya kuliah'}
                                onChange={() => {setKesimpulanPenggunaan('Beasiswa dibutuhkan untuk biaya kuliah');
                                  setForm({...form, kesimpulanPenggunaanDana: 'Beasiswa dibutuhkan untuk biaya kuliah'})}}
                              />
                              <span>Beasiswa dibutuhkan untuk biaya kuliah</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanpenggunaan"
                                value="Beasiswa dibutuhkan untuk biaya hidup"
                                checked={kesimpulanPenggunaan === 'Beasiswa dibutuhkan untuk biaya hidup'}
                                onChange={() => {setKesimpulanPenggunaan('Beasiswa dibutuhkan untuk biaya hidup');
                                  setForm({...form, kesimpulanPenggunaanDana: 'Beasiswa dibutuhkan untuk biaya hidup'})}}
                              />
                              <span>Beasiswa dibutuhkan untuk biaya hidup</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanpenggunaan"
                                value="Beasiswa lebih banyak digunakan untuk kebutuhan lain yang tidak mendesak"
                                checked={kesimpulanPenggunaan === 'Beasiswa lebih banyak digunakan untuk kebutuhan lain yang tidak mendesak'}
                                onChange={() => {setKesimpulanPenggunaan('Beasiswa lebih banyak digunakan untuk kebutuhan lain yang tidak mendesak');
                                  setForm({...form, kesimpulanPenggunaanDana: 'Beasiswa lebih banyak digunakan untuk kebutuhan lain yang tidak mendesak'})}}
                              />
                              <span>Beasiswa lebih banyak digunakan untuk kebutuhan lain yang tidak mendesak</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Kesimpulan dari hasil wawancara mengenai motivasi pribadi dan tujuan jangka panjang</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanmotivasi"
                                value="Motivasi dan tujuan jangka panjang sangat jelas, realistis dan penuh determinasi"
                                checked={kesimpulanMotivasi === 'Motivasi dan tujuan jangka panjang sangat jelas, realistis dan penuh determinasi'}
                                onChange={() => {setKesimpulanMotivasi('Motivasi dan tujuan jangka panjang sangat jelas, realistis dan penuh determinasi');
                                  setForm({ ...form, kesimpulanMotivasiPribadi: 'Motivasi dan tujuan jangka panjang sangat jelas, realistis dan penuh determinasi'})
                                }}
                              />
                              <span>Motivasi dan tujuan jangka panjang sangat jelas, realistis dan penuh determinasi</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanmotivasi"
                                value="Motivasi tinggi namun kurang terlihat penjelasan tujuan jangka panjang"
                                checked={kesimpulanMotivasi === 'Motivasi tinggi namun kurang terlihat penjelasan tujuan jangka panjang'}
                                onChange={() => {setKesimpulanMotivasi('Motivasi tinggi namun kurang terlihat penjelasan tujuan jangka panjang');
                                  setForm({ ...form, kesimpulanMotivasiPribadi: 'Motivasi tinggi namun kurang terlihat penjelasan tujuan jangka panjang'})}}
                              />
                              <span>Motivasi tinggi namun kurang terlihat penjelasan tujuan jangka panjang</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanmotivasi"
                                value="Tujuan jangka panjang baik namun motivasi rendah"
                                checked={kesimpulanMotivasi === 'Tujuan jangka panjang baik namun motivasi rendah'}
                                onChange={() => {setKesimpulanMotivasi('Tujuan jangka panjang baik namun motivasi rendah');
                                  setForm({ ...form, kesimpulanMotivasiPribadi: 'Tujuan jangka panjang baik namun motivasi rendah'})}}
                              />
                              <span>Tujuan jangka panjang baik namun motivasi rendah</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="kesimpulanmotivasi"
                                value="Tidak memiliki tujuan jangka panjang atau motivasi yang rendah"
                                checked={kesimpulanMotivasi === 'Tidak memiliki tujuan jangka panjang atau motivasi yang rendah'}
                                onChange={() => {setKesimpulanMotivasi('Tidak memiliki tujuan jangka panjang atau motivasi yang rendah');
                                  setForm({ ...form, kesimpulanMotivasiPribadi: 'Tidak memiliki tujuan jangka panjang atau motivasi yang rendah'})}}
                              />
                              <span>Tidak memiliki tujuan jangka panjang atau motivasi yang rendah</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Dukungan dari lingkungan (keluarga, sekolah dll)</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="dukungan"
                                value="1"
                                checked={dukungan === '1'}
                                onChange={() => {setDukungan('1');
                                  setForm({ ...form, dukunganDariLingkungan: '1'})
                                }}
                              />
                              <span>1</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="dukungan"
                                value="2"
                                checked={dukungan === '2'}
                                onChange={() => {setDukungan('2');
                                  setForm({ ...form, dukunganDariLingkungan: '2'})
                                }}
                              />
                              <span>2</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="dukungan"
                                value="3"
                                checked={dukungan === '3'}
                                onChange={() => {setDukungan('3');
                                  setForm({ ...form, dukunganDariLingkungan: '3'})
                                }}
                              />
                              <span>3</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="dukungan"
                                value="4"
                                checked={dukungan === '4'}
                                onChange={() => {setDukungan('4');
                                  setForm({ ...form, dukunganDariLingkungan: '4'})
                                }}
                              />
                              <span>4</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="dukungan"
                                value="5"
                                checked={dukungan === '5'}
                                onChange={() => {setDukungan('5');
                                  setForm({ ...form, dukunganDariLingkungan: '5'})
                                }}
                              />
                              <span>5</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Keinginan untuk membantu/terlibat di organisasi alumni</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginanmembantu"
                                value="1"
                                checked={keinginanMembantu === '1'}
                                onChange={() => {setKeinginanMembantu('1');
                                  setForm({ ...form, keinginanUntukMembantu: '1'})
                                }}
                              />
                              <span>1</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginanmembantu"
                                value="2"
                                checked={keinginanMembantu === '2'}
                                onChange={() => {setKeinginanMembantu('2');
                                  setForm({ ...form, keinginanUntukMembantu: '2'})
                                }}
                              />
                              <span>2</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginanmembantu"
                                value="3"
                                checked={keinginanMembantu === '3'}
                                onChange={() => {setKeinginanMembantu('3');
                                  setForm({ ...form, keinginanUntukMembantu: '3'})
                                }}
                              />
                              <span>3</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginanmembantu"
                                value="4"
                                checked={keinginanMembantu === '4'}
                                onChange={() => {setKeinginanMembantu('4');
                                  setForm({ ...form, keinginanUntukMembantu: '4'})
                                }}
                              />
                              <span>4</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginanmembantu"
                                value="5"
                                checked={keinginanMembantu === '5'}
                                onChange={() => {setKeinginanMembantu('5');
                                  setForm({ ...form, keinginanUntukMembantu: '5'})
                                }}
                              />
                              <span>5</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <legend className="font-medium">Keinginan untuk berkontribusi di Ikatan Alumni nantinya ketika menjadi alumni</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginankontribusi"
                                value="1"
                                checked={keinginanKontribusi === '1'}
                                onChange={() => {setKeinginanKontribusi('1');
                                  setForm({ ...form, keinginanUntukBerkontribusi: '1'})
                                }}
                              />
                              <span>1</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginankontribusi"
                                value="2"
                                checked={keinginanKontribusi === '2'}
                                onChange={() => {setKeinginanKontribusi('2');
                                  setForm({ ...form, keinginanUntukBerkontribusi: '2'})
                                }}
                              />
                              <span>2</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginankontribusi"
                                value="3"
                                checked={keinginanKontribusi === '3'}
                                onChange={() => {setKeinginanKontribusi('3');
                                  setForm({ ...form, keinginanUntukBerkontribusi: '3'})
                                }}
                              />
                              <span>3</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginankontribusi"
                                value="4"
                                checked={keinginanKontribusi === '4'}
                                onChange={() => {setKeinginanKontribusi('4');
                                  setForm({ ...form, keinginanUntukBerkontribusi: '4'})
                                }}
                              />
                              <span>4</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="keinginankontribusi"
                                value="5"
                                checked={keinginanKontribusi === '5'}
                                onChange={() => {setKeinginanKontribusi('5');
                                  setForm({ ...form, keinginanUntukBerkontribusi: '5'})
                                }}
                              />
                              <span>5</span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block font-medium">Tuliskan hal hal yang didapatkan dari pengamatan misalnya gadget dan pakaian yang dipakai (branded atau tidak), sikap mahasiswa saat di wawancara dll</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.tuliskanHalHalYangDidapat}
                            onChange={e => setForm({ ...form, tuliskanHalHalYangDidapat: e.target.value })}
                            placeholder="Hal yang Didapat"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Rekomendasi untuk mendapat beasiswa</legend>
                          <div className="space-y-2 mt-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="rekomendasi"
                                value="Ya"
                                checked={rekomendasi === 'Ya'}
                                onChange={() => {setRekomendasi('Ya');
                                  setForm({ ...form, rekomendasiUntukMendapat: 'Ya'})
                                }}
                              />
                              <span>Ya</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="rekomendasi"
                                value="Tidak"
                                checked={rekomendasi === 'Tidak'}
                                onChange={() => {setRekomendasi('Tidak');
                                  setForm({ ...form, rekomendasiUntukMendapat: 'Tidak'})}}
                              />
                              <span>Tidak</span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block font-medium">besaran beasiswa yang disarankan</label>
                          <input
                            type="text"
                            className="mt-1 w-full border p-2 rounded"
                            value={form.besaranBeasiswa}
                            onChange={e => setForm({ ...form, besaranBeasiswa: e.target.value })}
                            placeholder="Besaran Beasiswa Yang Disarankan"
                          />
                        </div>

                        <div>
                          <legend className="font-medium">Rekomendasi untuk jenis bantuan lain</legend>
                          {[
                            ['rekomendasiBiaya', 'Biaya hidup'],
                            ['rekomendasiKesehatan', 'Kesehatan bila saat sakit /dirawat'],
                            ['rekomendasiOrangtua', 'orangtua asuh'],
                          ].map(([key, label]) => (
                            <div key={key} className="mb-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={form[key as keyof typeof form] as boolean}
                                  onChange={() => handleCheckboxChange(key as keyof typeof form)}
                                  className="form-checkbox"
                                />
                                <span>{label}</span>
                              </label>
                            </div>
                          ))}
                          <div className="flex align-middle space-x-2">
                            <span className="self-center">Lainnya:</span>
                            <input
                              type="text"
                              className="mt-1 w-full border p-2 rounded"
                              value={form.rekomendasiOther}
                              onChange={e => setForm({ ...form, rekomendasiOther: e.target.value })}
                              placeholder="Lainnya"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium">Pertanyaan/catatan lainnya</label>
                          <textarea
                            className="mt-1 w-full border p-2 rounded"
                            rows={4}
                            value={form.pertanyaanLainnya || ''}
                            onChange={e => setForm({ ...form, pertanyaanLainnya: e.target.value })}
                            placeholder="Tuliskan pertanyaan atau catatan tambahan lainnya..."
                          />
                        </div>

                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          Submit
                        </button>
                      </form>
                    </div>
                  </div>
                </>
            )}
          </Card>
        </div>
      </div>
  )
}