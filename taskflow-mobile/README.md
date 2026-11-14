# TaskFlow Mobile (iOS & Android)

Cross-platform, local-first task manager built with **React Native (Expo SDK 55)**, **TypeScript**, **Expo Router**, **SQLite + Drizzle ORM**, **Zustand**, and **NativeWind**.

## Architecture

```text
app/                          # Expo Router file-based navigation
├── _layout.tsx               # SQLite migration runner + initial seed bootstrap
├── (tabs)/
│   ├── _layout.tsx           # Bottom tab bar (Tasks, Categories)
│   ├── index.tsx             # Task dashboard, live search, filter chips & FAB
│   └── categories.tsx        # Category creation & color swatches
└── task/[id].tsx             # Task detail editor & subtask checklist

src/
├── features/
│   ├── tasks/
│   │   ├── components/       # TaskCard, FilterBar, PriorityBadge, CreateTaskModal
│   │   ├── hooks/            # useTasks (reactive SQLite change listener)
│   │   ├── repository/       # taskRepository (CRUD + notification scheduling)
│   │   ├── store/            # useTaskUIStore (Zustand UI/filter state)
│   │   └── types/            # Domain & DTO interfaces
│   └── categories/
│       ├── hooks/            # useCategories
│       └── repository/       # categoryRepository
└── shared/
    ├── db/                   # Drizzle schema, expo-sqlite client, initial seed
    ├── services/             # Local push notifications (expo-notifications)
    └── utils/                # ID generator & date formatters
```

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start the development server**
   ```bash
   pnpm start
   ```
   - Press `i` to launch in the **iOS Simulator**
   - Press `a` to launch in the **Android Emulator**
   - Or scan the QR code with **Expo Go** on a physical device

3. **Run typecheck & unit tests**
   ```bash
   pnpm typecheck
   pnpm test
   ```

4. **Generate new SQLite migrations after editing `src/shared/db/schema.ts`**
   ```bash
   pnpm db:generate
   ```
