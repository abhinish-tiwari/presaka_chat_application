# Preṣaka Frontend (प्रेषक)

Modern, reactive web client for the Preṣaka real-time messaging application.

Built with **React 18**, **TypeScript**, **Vite 5**, **Redux Toolkit**, **Tailwind CSS 3.4**, and **Framer Motion 12**.

---

## 🛠 Tech Stack

- **UI Framework**: React 18.2 with strict TypeScript (TSX)
- **Build Tool**: Vite 5 for instant HMR and optimized production bundles
- **State Management**: Redux Toolkit 2.11 with `redux-persist` for durable auth & UI persistence
- **Routing**: React Router DOM v6 with protected route wrappers
- **Styling**: Tailwind CSS 3.4 with custom dark mode theme support
- **Animation**: Framer Motion 12 for smooth page transitions and modal springs
- **Real-Time Client**: Socket.IO Client 4.6 with automatic reconnection
- **HTTP Client**: Axios with request queuing and automatic JWT refresh interceptors
- **Notifications**: React Hot Toast for non-intrusive feedback

---

## 🚀 Setup & Local Execution

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Installation
```bash
cd frontend
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```
Default configuration for local development:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### 4. Available Scripts

- **`npm run dev`**: Starts the Vite development server at `http://localhost:5173`.
- **`npm run build`**: Type-checks and bundles the application for production to `dist/`.
- **`npm run preview`**: Locally serves the production build.
- **`npm run lint`**: Runs ESLint with flat config.
- **`npm run lint:fix`**: Automatically fixes lint issues.

---

## 📁 Project Directory Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI & layout elements
│   │   ├── auth/            # ProtectedRoute component
│   │   ├── chat/            # NewChatModal and chat-level modals
│   │   ├── layout/          # App Layout and Sidebar
│   │   │   └── sidebar/     # ChatItem, ChatList, SettingsTab, StatusTab, etc.
│   │   ├── profile/         # Profile editing modal
│   │   ├── ui/              # Hand-crafted component library (Button, Modal, Input, etc.)
│   │   ├── EmojiPicker.tsx  # Custom categorized emoji picker
│   │   ├── MessageActions.tsx # Quick reaction picker and action popovers
│   │   ├── PageTransition.tsx # Framer Motion route transition wrapper
│   │   └── ThemeToggle.tsx  # Dark / Light mode toggle button
│   ├── contexts/            # React Context providers
│   │   ├── SocketContext.tsx# Socket lifecycle and hook provider
│   │   └── ThemeContext.tsx # HTML document class theme provider
│   ├── pages/               # Top-level view routes
│   │   ├── auth/            # LoginPage (Phone input + OTP verification)
│   │   ├── chat/            # ChatPage (ChatHeader, MessageList, MessageComposer)
│   │   ├── home/            # Welcome / Empty state page
│   │   ├── ComponentsShowcase.tsx # Developer UI component demo page (/showcase)
│   │   └── SkeletonShowcase.tsx   # Loading skeleton demo page (/skeletons)
│   ├── services/            # Client-side API & socket services
│   │   ├── api.ts           # Axios instance with JWT refresh interceptor
│   │   ├── authService.ts   # OTP and session API calls
│   │   ├── chatService.ts   # Chat CRUD and message history API calls
│   │   ├── socketService.ts # Socket.IO client wrapper class
│   │   └── userService.ts   # User profile and search API calls
│   ├── store/               # Redux Toolkit store
│   │   ├── authStore.ts     # Auth token, user profile, persistence slice
│   │   ├── chatStore.ts     # Chats list, messages map, typing users, unread counts
│   │   ├── uiStore.ts       # Sidebar, modal states, theme slice
│   │   ├── hooks.ts         # Typed useAppDispatch & useAppSelector
│   │   └── index.ts         # Redux store and persistor config
│   ├── types/               # Strict TypeScript interfaces and union types
│   ├── utils/               # Formatting and validation helpers
│   ├── App.tsx              # Main routing and token expiry watchdogs
│   ├── main.tsx             # Application bootstrap with Redux Provider
│   └── index.css            # Tailwind directives and custom scrollbars
├── index.html               # Main entry HTML
├── vite.config.js           # Vite configuration with ESM path aliases
├── tailwind.config.js       # Tailwind CSS design system configuration
└── tsconfig.json            # TypeScript compiler configuration
```

---

## 🎨 Key Features & User Experience

- **Passwordless OTP Login**: Clean multi-step interface with auto-focus and countdown resend timer.
- **Instant Messaging**: Real-time conversation view with delivery/read receipt ticks, inline replies, and emoji reactions.
- **Message Editing & Deletion**: Edit messages within 15 minutes or soft-delete with instantaneous UI updates.
- **Presence & Activity**: Live green badges for online users, human-readable last seen timestamps, and animated typing indicators.
- **Conversation Controls**: Clear conversation history, block unwanted users, and delete chats directly from the chat header menu.
- **Theme Modes**: One-click switching between modern Dark mode and clean Light mode.
- **Component Showcase**: Visit `/showcase` or `/skeletons` during development to preview all UI components and loading states.
