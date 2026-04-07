---
description: Sinkronisasi Otomatis ke GitHub
---

Sebagai AI assistant, setiap kali kamu (Antigravity/AI) selesai melakukan modifikasi kode, menyelesaikan instruksi perubahan dari *User*, atau menuntaskan *task*, bacalah file workflow ini dan jalankan instruksi di bawah.

Pastikan kamu merangkum tugas yang baru saja kamu kerjakan ke dalam variabel pesan commit.

// turbo-all
1. Tambahkan semua perubahan dan dorong ke repositori remote (Ganti `[Pesan otomatis berdasarkan perubahan yang kamu lakukan]` dengan ringkasan padat 1 baris mengenai apa yang baru saja diselesaikan).

```bash
git add .
git commit -m "[Pesan otomatis berdasarkan perubahan yang kamu lakukan]"
git push
```
