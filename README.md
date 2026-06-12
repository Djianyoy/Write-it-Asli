# Medium Clone — Next.js + TypeScript + Prisma + Neon (PostgreSQL)

Full-featured Medium clone dibangun dengan Next.js 14 (App Router), TypeScript, Tailwind CSS, dan **PostgreSQL (Neon) via Prisma ORM** — siap deploy ke Vercel.

## Fitur

- **Auth** — login, register, logout (session via localStorage)
- **Feed** — daftar artikel dengan filter tag/topic dan sidebar trending
- **CRUD Artikel** — create, read, update, delete dengan rich-text editor (TipTap)
- **Clap** — toggle clap/unclap pada artikel
- **Bookmark** — simpan artikel ke reading list
- **Follow/Unfollow** — follow penulis lain
- **Profile** — tab Published & Drafts, jumlah follower
- **Search** — cari artikel & penulis
- **Settings** — edit nama, bio, avatar

## Stack

- **Framework**: Next.js 14 (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **Editor**: TipTap rich text
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **API**: Next.js API Routes (REST)

## Struktur Folder (feature-based)

```
src/
├── app/                     # Next.js App Router
│   ├── api/
│   │   ├── articles/        # GET list, POST create
│   │   │   └── [id]/        # GET, PUT, DELETE + /clap, /bookmark
│   │   ├── auth/login/       # POST login
│   │   ├── auth/register/    # POST register
│   │   ├── users/[username]  # GET/PUT profile + /follow
│   │   └── search/            # GET search
│   ├── article/[slug]/       # Halaman detail artikel
│   ├── write/                  # Tulis artikel baru
│   ├── write/[id]/            # Edit artikel
│   ├── login/, register/      # Halaman auth
│   ├── bookmarks/              # Reading list
│   ├── search/                  # Hasil pencarian
│   ├── settings/                # Setting profil
│   └── u/[username]/            # Halaman profil user
│
├── features/
│   ├── articles/
│   │   ├── components/        # ArticleCard, RichTextEditor
│   │   ├── hooks/              # useArticles
│   │   └── utils/              # articleUtils, serializers (Prisma -> JSON)
│   ├── auth/hooks/             # useAuth (AuthContext)
│   ├── feed/, profile/, search/
│
├── shared/
│   ├── components/             # Navbar
│   └── types/                  # TypeScript types (DTO)
│
└── lib/
    └── prisma.ts                # Prisma Client singleton

prisma/
├── schema.prisma                # Model database (User, Article, Clap, Bookmark, Follow)
└── seed.ts                       # Data awal/dummy
```

## Quick Start

```bash
npm install
cp .env.example .env   # isi dengan connection string Neon, lihat DEPLOY.md
npm run db:push        # buat tabel di database
npm run db:seed        # isi data contoh
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

➡️ **Untuk panduan lengkap setup database & deploy ke Vercel, baca [DEPLOY.md](./DEPLOY.md)**

## Demo Accounts

| Name | Email | Password |
|------|-------|----------|
| John Doe | john@example.com | password123 |
| Jane Doe | jane@example.com | password123 |
| Alex Smith | alex@example.com | password123 |
