# LinkedIn Profile Analyzer & Job Matcher AI

Aplikasi cerdas berbasis Next.js yang mengintegrasikan Scraping LinkedIn, Analisis AI, dan Pencarian Lowongan Kerja secara otomatis.

## 🌟 Fitur Utama

1.  **AI-Driven Job Search (Baru!)** 🧠
    *   Tidak sekadar mencocokkan teks, aplikasi ini menggunakan AI untuk menganalisis profil pengguna dan menentukan **keyword pencarian kerja terbaik**.
    *   Hasil rekomendasi pekerjaan jauh lebih relevan dan spesifik sesuai keahlian kandidat.

2.  **Professional Resume Generator** 📄
    *   Mengubah data profil yang berantakan menjadi Resume Profesional dalam **Bahasa Indonesia**.
    *   Dibuat otomatis oleh Large Language Model (DeepSeek/OpenAI Compatible).

3.  **LinkedIn Scraper Integration** 🔍
    *   Hanya dengan satu input URL, aplikasi mengambil data lengkap (Pengalaman, Pendidikan, Skill) menggunakan **LinkdAPI**.

## 🛠️ Teknologi yang Digunakan

*   **Framework**: Next.js 15 (App Router)
*   **Styling**: Tailwind CSS
*   **AI Engine**: Hugging Face Inference API (DeepSeek-V3)
*   **Scraper**: LinkdAPI
*   **Job Data**: LinkedIn Job Search API (RapidAPI)

## 📦 Cara Install & Menjalankan

### 1. Clone Repository

```bash
git clone <repository-url>
cd apify-actor-runner
npm install
```

### 2. Setup Environment Variables

Duplikasi file `.env.local` (atau buat baru) dan isi API Key yang diperlukan:

```bash
# Buat file .env.local di root folder
touch .env.local
```

Isi file `.env.local`:
```env
# LinkdAPI (Untuk Scraping Profil)
LINKDAPI_TOKEN=li-xxxxxx

# RapidAPI (Untuk Search Jobs)
RAPIDAPI_KEY=xxxxx

# Hugging Face (Untuk AI Chat)
HUGGINGFACE_TOKEN=hf_xxxxx

# AI Model (Opsional, default: deepseek-ai/DeepSeek-V3.2:novita)
AI_MODEL_ID=deepseek-ai/DeepSeek-V3.2:novita
```

### 3. Jalankan Aplikasi

```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

Kamu juga bisa menjalankan aplikasi ini menggunakan Docker.

### 1. Build Image

```bash
docker build -t linkedin-profile-analyzer .
```

### 2. Run Container

Pastikan flag `--env-file` mengarah ke file `.env.local` kamu yang sudah diisi key.

```bash
docker run -p 3000:3000 --env-file .env.local linkedin-profile-analyzer
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

## 🔄 Alur Kerja Aplikasi

1.  User memasukkan **URL LinkedIn**.
2.  **Scraper** mengambil data JSON profil tersebut.
3.  **AI (LLM)** menganalisis data untuk:
    *   Menulis Resume dalam Bahasa Indonesia.
    *   Menentukan `JOB_SEARCH_QUERY` (Kata kunci jabatan paling pas).
4.  **Job Search API** mencari lowongan menggunakan kata kunci dari AI.
5.  Hasil Resume dan Lowongan Kerja ditampilkan dalam satu layar.

## 👤 Author

**Ahmad Maulana Rismadin**

## 📄 License

Project ini dilisensikan di bawah lisensi [MIT](LICENSE).
