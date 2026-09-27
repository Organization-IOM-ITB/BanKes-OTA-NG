# Migrasi MinIO → Garage

**Latar.** 27 September 2026 deploy gagal karena `quay.io/minio/mc` membalas
`unauthorized`, dan produksi ikut mati. Penelusuran memastikan MinIO
menutup distribusi publiknya: `minio/minio` dan `minio/mc` membalas **401 di
quay.io maupun Docker Hub** (termasuk `:latest`), sementara repo lain di
quay.io normal (kontrol: `prometheus/busybox`, `argoproj/argocd` → 200).
Biner resmi di `dl.min.io` juga **410 Gone**, server maupun client, versi
terbaru maupun arsip. Jadi membangun image sendiri pun bukan jalan keluar.

**Kenapa Garage.** Aplikasi tidak memakai satu pun API khas MinIO — hanya
`putObject`, `removeObject`, `makeBucket`, `bucketExists` (OTA-KU & bankes,
klien `minio@8`). Yang khas MinIO hanya `mc anonymous set public` di
deployment. Garage S3-compatible, AGPL, aktif, image bisa ditarik dan
di-pin, dan datanya tetap di server sendiri.

**Yang TIDAK berubah:** kode aplikasi, nama env `MINIO_*`, nama bucket, dan
bentuk URL publik `https://bankes.iom-itb.id/minio-static/<bucket>/<key>`.

---

## Perbedaan yang perlu disadari

| | MinIO | Garage |
|---|---|---|
| Port S3 | 9000 | **3900** |
| Penyajian publik | port S3 yang sama, path `/bucket/key` | **endpoint web terpisah (3902)**, bucket dikenali dari **Host header** |
| Bucket publik | `mc anonymous set public` | `garage bucket website --allow <bucket>` |
| Kredensial | root user/password | key ber-ID format `GK…`, dibuat lewat CLI |
| Bootstrap | tidak ada | **wajib**: layout cluster di-assign & apply sekali |

Karena bucket dikenali dari Host, rute Traefik men-strip
`/minio-static/<bucket>` **seluruhnya** lalu menyetel `Host: <bucket>`,
sehingga URL lama tetap valid tanpa mengubah data.

---

## 0. Amankan dulu

```bash
# Image MinIO di cache server sudah TIDAK TERGANTIKAN
docker save quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z | gzip > ~/minio-image-backup.tar.gz

# Cadangkan volume data lama
docker run --rm -v qwnssdwthwl9j0ymwaxvhz92_minio-data:/data -v ~:/backup \
  alpine tar czf /backup/minio-data-backup.tar.gz -C /data .
```

Jangan hapus volume `minio-data` sampai verifikasi di langkah 6 lulus.

## 1. Siapkan rahasia & env di Coolify

```bash
openssl rand -hex 32   # -> GARAGE_RPC_SECRET
openssl rand -base64 32 # -> GARAGE_ADMIN_TOKEN
```

Tambahkan di Coolify: `GARAGE_RPC_SECRET`, `GARAGE_ADMIN_TOKEN`,
`S3_ACCESS_KEY`, `S3_SECRET_KEY` (dua terakhir diisi sementara apa saja —
nilainya baru diketahui di langkah 3).

`MINIO_BUCKET_NAME` dan `MINIO_PUBLIC_URL` **tetap seperti sekarang**.
`MINIO_PUBLIC_URL` harus tetap terisi; kalau kosong, aplikasi jatuh ke
`MINIO_PUBLIC_HOST`/`PORT` yang sudah tidak relevan.

## 2. Deploy

Garage akan hidup tapi belum melayani apa pun sampai layout di-apply.

## 3. Bootstrap Garage (sekali saja)

```bash
G="docker exec -it iom-ota-garage-prod garage"

$G status                       # catat Node ID yang muncul
$G layout assign -z dc1 -c 50G <NODE_ID>
$G layout apply --version 1

$G bucket create ${MINIO_BUCKET_NAME}
$G key create iom-app
$G bucket allow --read --write --owner ${MINIO_BUCKET_NAME} --key iom-app

# Padanan `mc anonymous set public`
$G bucket website --allow ${MINIO_BUCKET_NAME}

# Tampilkan kredensial -> isikan ke S3_ACCESS_KEY / S3_SECRET_KEY di Coolify
$G key info iom-app --show-secret
```

Sesuaikan `-c 50G` dengan kapasitas yang ingin dialokasikan. Setelah
kredensial diisi, **deploy ulang** agar aplikasi memakainya.

## 4. Pindahkan data lama

`mc` sudah tidak tersedia, jadi penyalinan memakai **rclone**. MinIO lama
dijalankan sementara dari image yang masih ada di cache.

```bash
NET=$(docker inspect iom-ota-garage-prod \
       -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | tr ' ' '\n' | grep iom-ota)

docker run -d --name minio-old --network "$NET" \
  -v qwnssdwthwl9j0ymwaxvhz92_minio-data:/data \
  -e MINIO_ROOT_USER="<MINIO_ROOT_USER lama>" \
  -e MINIO_ROOT_PASSWORD="<MINIO_ROOT_PASSWORD lama>" \
  quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z server /data

docker run --rm --network "$NET" \
  -e RCLONE_CONFIG_OLD_TYPE=s3 -e RCLONE_CONFIG_OLD_PROVIDER=Minio \
  -e RCLONE_CONFIG_OLD_ENDPOINT=http://minio-old:9000 \
  -e RCLONE_CONFIG_OLD_ACCESS_KEY_ID="<MINIO_ROOT_USER lama>" \
  -e RCLONE_CONFIG_OLD_SECRET_ACCESS_KEY="<MINIO_ROOT_PASSWORD lama>" \
  -e RCLONE_CONFIG_NEW_TYPE=s3 -e RCLONE_CONFIG_NEW_PROVIDER=Other \
  -e RCLONE_CONFIG_NEW_ENDPOINT=http://garage:3900 \
  -e RCLONE_CONFIG_NEW_REGION=us-east-1 \
  -e RCLONE_CONFIG_NEW_ACCESS_KEY_ID="<GK… dari langkah 3>" \
  -e RCLONE_CONFIG_NEW_SECRET_ACCESS_KEY="<secret dari langkah 3>" \
  rclone/rclone:1.71.0 \
  copy OLD:${MINIO_BUCKET_NAME} NEW:${MINIO_BUCKET_NAME} --progress --checksum

# Bandingkan jumlah & ukuran objek
docker run --rm --network "$NET" -e ... rclone/rclone:1.71.0 \
  check OLD:${MINIO_BUCKET_NAME} NEW:${MINIO_BUCKET_NAME} --one-way

docker rm -f minio-old
```

## 5. Deploy ulang aplikasi

Agar `bankes` dan `ota-backend` memakai kredensial Garage.

## 6. Verifikasi sebelum menghapus apa pun

```bash
# Berkas publik lama harus tetap terbuka di URL yang sama
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' \
  "https://bankes.iom-itb.id/minio-static/${MINIO_BUCKET_NAME}/<salah-satu-key-lama>"
```

Lalu lewat aplikasi: unggah satu berkas baru di OTA-KU atau Bankes, pastikan
tampil, lalu hapus. Itu menguji `putObject` + `removeObject` + penyajian
publik sekaligus.

## 7. Bersih-bersih (hanya setelah langkah 6 lulus)

```bash
docker volume rm qwnssdwthwl9j0ymwaxvhz92_minio-data
```

Simpan `minio-data-backup.tar.gz` beberapa waktu sebagai jaring pengaman.

---

## Bagian yang belum bisa diuji dari luar

Jujur soal batas verifikasi — hal berikut baru ketahuan saat dijalankan:

1. **Override `Host` header di Traefik.** Label
   `headers.customrequestheaders.Host` tidak selalu menimpa Host di semua
   versi Traefik. Kalau berkas publik membalas 404 padahal objeknya ada,
   ini tersangka pertama. Alternatifnya: setel `root_domain` pada
   `[s3_web]` ke `.bankes.iom-itb.id` lalu arahkan rute ke Host
   `<bucket>.bankes.iom-itb.id` (butuh DNS wildcard), atau pasang
   subdomain khusus untuk berkas publik.
2. **`healthcheck` memakai `garage status`** — mengembalikan non-zero
   sebelum layout di-apply, jadi pada deploy pertama service akan tampak
   `unhealthy` sampai langkah 3 selesai. Itu wajar, bukan kegagalan.
3. **Perilaku `minio@8` terhadap Garage.** Dokumentasi Garage menyatakan
   `GetBucketLocation` serta path-style dan vhost-style didukung, dan
   `s3_region` sengaja diisi `us-east-1` agar klien tidak perlu diubah —
   tetapi kombinasi persisnya belum diuji di lingkungan ini.

## Menyusul: moki-NG

`moki-NG` menjalankan MinIO-nya sendiri dan akan menemui masalah image yang
sama pada deploy berikutnya. Pemakaiannya seluruhnya ada di satu berkas,
`app/lib/object-storage.ts`, memakai `@aws-sdk/client-s3` (PutObject,
GetObject, DeleteObject(s), CreateBucket, HeadBucket + presigner) — semuanya
S3 murni, jadi pola yang sama berlaku. **Presigned URL perlu diuji
tersendiri**, karena fitur itu tidak dipakai di BanKes-OTA-NG.
