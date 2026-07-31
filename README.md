# TaskNest 📝

**TaskNest** is a lightweight, scalable work note and task management web application designed for small teams (~10 users). It enables seamless organization of personal work notes alongside collaborative team notes with fine-grained permission controls.

---

## ✨ Features

- **🔒 Private Work Notes**: Personal notes visible exclusively to the owner.
- **🤝 Shared Work Notes**: Collaborate on team notes by inviting specific members with granular permissions (`view` or `edit`).
- **🛡️ Row Level Security (RLS)**: Database-level isolation powered by Supabase to guarantee data privacy.
- **⚡ Real-time Updates**: Live updates for shared team notes and task progress.
- **🏷️ Organization & Filters**: Filter tasks by type (Private vs. Shared), status (*To Do*, *In Progress*, *Completed*), or tags.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [Next.js 14+](https://nextjs.org/) (App Router, React 19, TypeScript) |
| **Backend / Database** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime & RLS) |
| **State & Data Fetching** | [TanStack Query v5](https://tanstack.com/query) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) |

---

## 📁 Project Structure

The project follows a **Feature-Driven & Layered Architecture** for scalability and maintainability:

```
src/
├── app/                        # Next.js App Router (Pages & Layouts)
│   ├── (auth)/                 # Login & Registration pages
│   ├── (dashboard)/            # Dashboard, Private & Shared Notes views
│   └── api/                    # API Route Handlers
├── features/                   # Domain-driven feature modules
│   ├── auth/                   # Authentication logic & components
│   ├── notes/                  # Core Note & Task management logic
│   └── sharing/                # Invitation & Member management
├── components/                 # Global UI & Shared Layout components
│   ├── ui/                     # Atomic UI elements (Buttons, Modals, Inputs)
│   └── common/                 # Header, Sidebar, Spinners
├── services/                   # Base service abstraction layer
├── repositories/               # Supabase database query handlers
├── lib/                        # Supabase client initializations (Client/Server/Middleware)
├── types/                      # TypeScript type definitions & auto-generated DB types
└── constants/                  # Application constants & routes
```

---

## 🗄️ Database Schema & Security (RLS)

- **`profiles`**: Stores user profiles synced with Supabase Auth.
- **`notes`**: Stores note metadata, content, privacy status (`is_private`), and owner (`owner_id`).
- **`note_members`**: Manages invitations (`user_id`, `note_id`, `permission`: `'view' | 'edit'`).

### Security Rules
- **Private Notes**: Accessible **only** if `owner_id = auth.uid()`.
- **Shared Notes**: Accessible if `owner_id = auth.uid()` or if user has an accepted membership in `note_members`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm / pnpm / yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dungvu242k3/TaskNest.git
   cd TaskNest
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Commit Conventions

This project strictly follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring without functionality changes
- `style:` Formatting or UI styling changes

---

## 📄 License

This project is licensed under the MIT License.