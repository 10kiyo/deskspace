# DeskSpace HQ

Kantor virtual 2D multiplayer bergaya *Gather.town* yang dibangun dengan **Next.js**, **HTML5 Canvas**, dan **Supabase Realtime**.

**Live Demo:** [deskspace-gilt.vercel.app](https://deskspace-gilt.vercel.app)

## Fitur Utama

* **Multiplayer Real-Time:** Sinkronisasi posisi karakter, status duduk, chat, dan *Wave* antar pemain secara langsung menggunakan **Supabase Realtime (Presence & Broadcast)**.
* **Kustomisasi Avatar Chibi:** Pilihan nama, peran (*role*), warna baju, serta gaya rambut dan aksesori (*Pendek Poni*, *Panjang Sebahu*, dan *Topi Merah*) dengan *live canvas preview* di lobby.
* **Ruang Kantor Interaktif:**
  * Pergerakan 1:1 menggunakan tombol **WASD** atau **Panah** (serta klik langsung pada lantai).
  * Otomatis duduk saat mendekati kursi kerja maupun sofa di *Coffee Lounge*.
  * Deteksi zona otomatis (*Main Hallway*, *Work Desk Zone*, *Meeting Room*, dan *Coffee Lounge*).
* **Spatial Chat & Wave:** Gelembung chat muncul langsung di atas kepala karakter, dilengkapi tombol *Wave* dengan efek suara *chime* saat berada di dekat rekan kerja.

## Tech Stack

* **Framework:** Next.js (App Router) & TypeScript
* **Styling & Icons:** Tailwind CSS & Lucide React
* **Rendering:** Custom 2D Top-Down Pixel Canvas (`lib/isoRenderer.ts`)
* **Realtime & Database:** Supabase (`deskspace` schema)
* **Deployment:** Vercel

## Menjalankan Secara Lokal

1. Clone repository ini:

   ```bash
   git clone [https://github.com/10kiyo/deskspace.git](https://github.com/10kiyo/deskspace.git)
   cd deskspace
