# EE37 | Electrical Engineering Batch 37

### Sudan University of Science and Technology

![EE37 Banner](https://cp02bmy0uy.ufs.sh/f/0au6VoLZCTzGdHg7zpcjmLa2sVwTxnlRKGEXucqoZFhv9g31)

A premium digital platform dedicated to the 37th batch of Electrical Engineering at Sudan University of Science and Technology. This application serves as a central hub for memories, academic resources, and batch documentation, built with a "Golden Blueprint" aesthetic that reflects the prestige of the engineering profession.

## 🌟 Features

- **The Survey (سجل ذكرياتك)**: A digital guestbook for batch mates to leave their mark, share memories, and write comments.
- **Gallery (معرض الذكريات)**: A curated collection of photos and moments from our university years.
- **Academic Library (المكتبة الأكاديمية)**: A resource center for references, lectures, and academic materials.
- **Premium Design**: Featuring a "Golden Blueprint" theme with dark navy backgrounds, gold accents, and fluid animations.

## 🛠️ Tech Stack

This project is built using the [T3 Stack](https://create.t3.gg/), maximizing type safety and developer experience.

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + Styled Layouts
- **Database**: [Drizzle ORM](https://orm.drizzle.team) with PostgreSQL
- **API**: [tRPC](https://trpc.io) for end-to-end type safety
- **UI/UX**: [Framer Motion](https://www.framer.com/motion/) for animations, [Lucide](https://lucide.dev) for icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- A PostgreSQL database (local or hosted)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/kamkmgamer/ee37.git
    cd ee37
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Copy the example environment file and update your database credentials.

    ```bash
    cp .env.example .env
    ```

    Update `DATABASE_URL` in `.env` with your PostgreSQL connection string.

4.  **Database Migration**
    Push the schema to your database.

    ```bash
    pnpm db:push
    ```

5.  **Run Development Server**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📂 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/server`: Backend logic including tRPC routers and Drizzle schema.
- `src/styles`: Global CSS and Tailwind configuration updates.
- `public`: Static assets.

## 🎨 Design System

The UI is built on a custom "Golden Blueprint" palette:

- **Midnight Navy**: `#0A1628` (Primary Background)
- **Gold**: `#D4A853` (Primary Accent)
- **Copper**: `#B87333` (Secondary Accent)
- **Paper**: `#FAF7F0` (Content Background)

## 📜 License

[MIT](LICENSE)
