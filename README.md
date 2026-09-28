# Preṣaka (प्रेषक)

### *The Trusted Messenger — Messages. Delivered.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-5.0.11-purple)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-3.4.1-38bdf8)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-14%2B-336791)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-6%2B-dc382d)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/socket.io-4.6.1-black)](https://socket.io/)

Preṣaka (प्रेषक) is a production-grade, real-time messaging application engineered with an **India-first, global-ready** architecture. Built with **phone number + OTP passwordless authentication**, a strict **TypeScript + React 18** frontend, an **event-driven Node.js/Express + Socket.IO** backend, and a persistent hybrid data layer (**PostgreSQL 14+** relational database + **Redis** in-memory cache), Preṣaka delivers low latency, uncompromising security, and clean modern aesthetics.

---

## 📌 Table of Contents

- [Vision & Architecture Philosophy](#-vision--architecture-philosophy)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Implemented Features & Technical Architecture](#-implemented-features--technical-architecture)
  - [1. Authentication & Security Engine](#1-authentication--security-engine)
  - [2. Real-Time Chat & WebSocket Messaging](#2-real-time-chat--websocket-messaging)
  - [3. Message Lifecycle, Receipts & Actions](#3-message-lifecycle-receipts--actions)
  - [4. Presence, Activity & Status Engine](#4-presence-activity--status-engine)
  - [5. Conversation Management & Privacy Controls](#5-conversation-management--privacy-controls)
  - [6. User Discovery & Profile Management](#6-user-discovery--profile-management)
  - [7. Design System, Theming & UI/UX](#7-design-system-theming--uiux)
- [Remaining Features & Technical Implementation Blueprint](#-remaining-features--technical-implementation-blueprint)
  - [Phase 1: High-Priority Enhancements](#phase-1-high-priority-enhancements)
  - [Phase 2: Platform & Usability Expansions](#phase-2-platform--usability-expansions)
  - [Phase 3: Real-Time Audio/Video & Deep Security](#phase-3-real-time-audiovideo--deep-security)
- [Tech Stack Overview](#-tech-stack-overview)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Database Schema & Migrations](#-database-schema--migrations)
- [Documentation Index](#-documentation-index)
- [License](#-license)

---

## 🎯 Vision & Architecture Philosophy

> *"Build the simplest thing that works — but design it so it can scale seamlessly."*

1. **India-First Identity**: Mobile numbers are the universal digital identity. No forgotten passwords, friction-free login via SMS OTP.
2. **Strict Reliability & Offline Resilience**: Instant UI updates via optimistic Redux state mutations combined with guaranteed delivery receipts and automatic socket reconnection.
3. **Decoupled Event-Driven Core**: Real-time communication runs through isolated Socket.IO handlers, while heavy relational transactions run through PostgreSQL with connection pooling.
4. **Zero State Pollution**: Ephemeral data (typing indicators, active socket sessions, OTP hashes) lives in Redis with strict TTLs; durable data (users, messages, receipts, conversation blocks) lives in PostgreSQL.

---

## 🏗 System Architecture & Data Flow

```
                      +---------------------------------------+
                      |           Client (Browser)            |
                      |   React 18 + Vite + Redux Toolkit     |
                      +-------------------+-------------------+
                                          |
                        HTTPS (REST API)  |  WSS (Socket.IO)
                                          |
                      +-------------------v-------------------+
                      |      Node.js / Express Server         |
                      |   - Auth & Rate Limiters              |
                      |   - REST Controllers & Validators     |
                      |   - Modular Socket.IO Handlers        |
                      +---------+-------------------+---------+
                                |                   |
               Relational Data  |                   | Ephemeral Cache
                                |                   | & Session State
                      +---------v---------+       +-v-----------------+
                      |   PostgreSQL 14+  |       |   Redis Server    |
                      | - users           |       | - otp:{phone}     |
                      | - chats           |       | - sockets:{uid}   |
                      | - messages        |       | - presence:{uid}  |
                      | - chat_clears     |       | - typing:{cid:uid}|
                      | - user_blocks     |       +-------------------+
                      | - receipts        |
                      +-------------------+
```

---

## ✨ Implemented Features & Technical Architecture

### 1. Authentication & Security Engine

Preṣaka uses passwordless authentication designed around mobile devices.

- **Request OTP (`POST /api/auth/request-otp`)**:
  - Validates E.164 phone formats (e.g., `+919876543210`).
  - Rate-limited via [rateLimiter.js](file:///d:/01.%20learnings/react-learning/presaka/backend/src/middleware/rateLimiter.js) (5 requests per 15 minutes per IP).
  - Generates a cryptographically randomized 6-digit numeric OTP and a unique `requestId` (`req_<uuid>`).
  - Hashes OTP using `bcryptjs` (configurable rounds, default: 10) before caching.
  - Caches payload `{ hash, attempts: 0, requestId }` in Redis at `otp:<phone>` with a strict 5-minute TTL (`OTP_EXPIRY=300`).
  - Dispatches OTP via [sms.service.js](file:///d:/01.%20learnings/react-learning/presaka/backend/src/services/sms.service.js) (supports MSG91 API, Twilio hook, or local console logging when `SMS_ENABLED=false`).
- **Verify OTP (`POST /api/auth/verify-otp`)**:
  - Validates `requestId` matching and compares OTP hash via `bcrypt.compare`.
  - Max 3 attempts enforced in Redis; auto-eviction on consecutive failed attempts to prevent brute-force attacks.
  - Upon success, retrieves or auto-provisions the user in PostgreSQL (`users` table). Automatically assigns default names (e.g. `User 3210`) ensuring no `NULL` username issues.
  - Deletes the Redis key immediately upon successful verification.
- **Dual JWT Token Architecture**:
  - **Access Token**: Short-lived (15 minutes), containing `{ userId, phone }`. Stored purely in memory in Redux state (`authStore.ts`).
  - **Refresh Token**: Long-lived (7 days), stored in an `httpOnly`, `secure`, `sameSite: 'strict'` HTTP cookie.
  - **Proactive Token Refresh**: Client-side Axios interceptor ([api.ts](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/services/api.ts)) monitors token expiration and queues outgoing requests while automatically refreshing via `POST /api/auth/refresh` before the access token expires.
  - **Session Invalidation**: `POST /api/auth/logout` clears the refresh cookie and purges active sessions.

---

### 2. Real-Time Chat & WebSocket Messaging

Real-time interactions are powered by Socket.IO over secure WebSockets with fallback to long polling.

- **Socket Authentication Middleware**:
  - Every connection handshake executes [index.js](file:///d:/01.%20learnings/react-learning/presaka/backend/src/socket/index.js), verifying `socket.handshake.auth.token` via JWT verification.
  - Attaches `socket.userId` and `socket.phone` directly to the socket context; unauthorized handshakes are rejected before entering rooms.
- **Dynamic Room Subscription**:
  - On connection, the server queries all active chats for the authenticated user and automatically registers the socket into isolated rooms: `chat:<chatId>`.
- **Sending Messages (`message:send`)**:
  - Validates chat membership via [ChatModel.isMember](file:///d:/01.%20learnings/react-learning/presaka/backend/src/models/chat.model.js).
  - Checks bidirectional block status: if either user has blocked the other, message emission is rejected with `CHAT_BLOCKED`.
  - Inserts message record in PostgreSQL (`messages` table) with content, sender, timestamp, and optional `reply_to_message_id`.
  - Generates initial delivery receipt records in `message_receipts` for all participants.
  - Emits `message:sent` back to the sender containing the client's temporary ID (`tempId`) for optimistic UI reconciliation.
  - Broadcasts `message:receive` to the room `chat:<chatId>`.
  - Touches `updated_at` on the `chats` record to bubble active conversations to the top.

---

### 3. Message Lifecycle, Receipts & Actions

Preṣaka features complete message lifecycle tracking matching industry standards:

- **Delivery Receipts (`message:delivered`)**:
  - When recipient clients receive a message via socket while active, they emit `message:delivered`.
  - Backend updates `message_receipts.delivered_at` and broadcasts `message:status` with `status: 'delivered'`.
- **Read Receipts (`message:read`)**:
  - When the active conversation is open and messages enter the viewport, the frontend marks them as read and emits `message:read`.
  - Backend updates `message_receipts.read_at` and broadcasts `message:status` with `status: 'read'`.
  - Rendered in [MessageList.tsx](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/pages/chat/components/MessageList.tsx) as:
    - `sent`: Single grey tick (✓)
    - `delivered`: Double grey tick (✓✓)
    - `read`: Double blue tick (✓✓)
- **Message Editing (`message:edit`)**:
  - Handled via `socket.on('message:edit')` in [messageHandler.js](file:///d:/01.%20learnings/react-learning/presaka/backend/src/socket/handlers/messageHandler.js).
  - Validates sender ownership and enforces a strict **15-minute time window** from message creation.
  - Updates PostgreSQL content and broadcasts `message:edited` with `isEdited: true` and new timestamp to room participants.
- **Message Deletion (`message:delete`)**:
  - Only the message author can delete their messages.
  - Executes a soft delete by setting `deleted_at = CURRENT_TIMESTAMP`, keeping relational foreign keys intact while filtering from active queries.
  - Broadcasts `message:deleted` to immediately remove or mask the bubble across connected clients.
- **Replies & Quoting**:
  - Users can quote prior messages. The composer stores `replyingTo` state and passes `replyToId`.
  - Quoted messages render an interactive preview bubble that jumps and highlights the referenced message.
- **Real-Time Reactions**:
  - Users can react with emojis (👍, ❤️, 😂, 😮, 😢, 🙏).
  - Emits `message:reaction:add` and `message:reaction:remove`.
  - Reactions render interactively below message bubbles with live user attribution.
- **Emoji Picker**:
  - Custom categorized emoji picker integrated in [EmojiPicker.tsx](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/components/EmojiPicker.tsx) supporting smileys, gestures, hearts, and symbols without external heavy dependencies.

---

### 4. Presence, Activity & Status Engine

Presence and activity are managed through Redis for instant synchronization across multiple browser tabs and devices.

- **Multi-Session Presence Tracking**:
  - Each connected socket ID is tracked in a Redis Set: `sockets:<userId>`.
  - User status is written to Redis key `presence:<userId>` with fields `{ status: 'online', socketId }`.
  - On disconnection, the socket is removed from `sockets:<userId>`. Only when the set becomes empty (`activeSockets.length === 0`) does the system transition the user to `offline`, updating PostgreSQL `users.last_seen` and broadcasting `user:offline` with the last seen timestamp.
- **Peer Presence Discovery**:
  - Upon establishing connection, the backend inspects presence keys for all contacts in the user's active chats and returns `users:online` with active user IDs.
  - Broadcasts `user:online` to all peer rooms.
- **Human-Readable Last Seen**:
  - Formatted via [formatters.ts](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/utils/formatters.ts) (*"Online"*, *"Last seen 5m ago"*, *"Last seen yesterday at 4:15 PM"*).
- **Dynamic Typing Indicators**:
  - Client emits `typing:start` and `typing:stop` via debounced inputs in [MessageComposer.tsx](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/pages/chat/components/MessageComposer.tsx).
  - Backend sets temporary key `typing:<chatId>:<userId>` in Redis with a 5-second automatic TTL to prevent stuck typing states.
  - Broadcasts `user:typing` and `user:stopped-typing` to the other chat members.

---

### 5. Conversation Management & Privacy Controls

Preṣaka provides robust conversation actions backed by dedicated database tables:

- **Per-User Chat Clearing (`POST /api/chats/:chatId/clear`)**:
  - Backed by the `chat_clears` table (`chat_id`, `user_id`, `cleared_at`).
  - Allows an individual user to wipe chat history from their device without deleting messages for the other participant.
  - Queries for messages filter by `m.created_at > COALESCE(cc.cleared_at, TO_TIMESTAMP(0))`.
- **User Blocking (`POST /api/chats/:chatId/block`)**:
  - Backed by the `user_blocks` table (`blocker_id`, `blocked_id`).
  - Enforces privacy at the database and socket layer: blocked users cannot send messages or initiate new private chats with the blocker.
- **Conversation Deletion (`DELETE /api/chats/:chatId`)**:
  - Soft-leaves a chat by updating `chat_members.left_at`.
  - Removes the conversation from the user's sidebar feed while preserving archival integrity.
- **Unread Message Badging**:
  - Calculated dynamically per chat using unread count queries in [chat.model.js](file:///d:/01.%20learnings/react-learning/presaka/backend/src/models/chat.model.js) comparing message creation against receipts.
  - Automatically resets when a conversation is opened via `dispatch(resetUnreadCount(chatId))`.
- **Conversation Search**:
  - Real-time client-side filtering by contact name or phone number in [Sidebar.tsx](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/components/layout/sidebar/Sidebar.tsx).

---

### 6. User Discovery & Profile Management

- **Phone Directory Search (`GET /api/users/search?phone=`)**:
  - Prefix matching on verified phone numbers to discover registered contacts and start new chats.
- **Profile Updates (`PATCH /api/users/me`)**:
  - Update display name and personal bio with input validation.
  - Profile modal with dynamic avatars and real-time state sync across Redux and server.
- **Automatic CamelCase/SnakeCase Mapping**:
  - All database queries return standard PostgreSQL `snake_case` which is automatically converted to `camelCase` for TypeScript consumption via [caseConverter.js](file:///d:/01.%20learnings/react-learning/presaka/backend/src/utils/caseConverter.js).

---

### 7. Design System, Theming & UI/UX

- **Dark & Light Mode**:
  - Tailwind CSS dark class strategy toggled through [ThemeContext.tsx](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/contexts/ThemeContext.tsx) and [ThemeToggle.tsx](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/components/ThemeToggle.tsx).
  - Persisted in browser `localStorage`.
- **Page Transitions & Micro-Animations**:
  - Page routing transitions and modal appearances orchestrated using `framer-motion` (`AnimatePresence`).
- **Comprehensive UI Component Library** ([frontend/src/components/ui](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/components/ui)):
  - Built from scratch in TypeScript with zero third-party component bloat:
    - `Button`, `Input`, `Modal`, `Dropdown`, `Avatar`, `Badge`, `Card`, `Checkbox`, `Radio`, `Select`, `Tooltip`, `Spinner`.
    - Skeleton loaders for chats, messages, and profile views (`SkeletonLoaders.tsx`).
- **Component Showcases**:
  - Dedicated developer routes at `/showcase` and `/skeletons` for visual component verification.

---

## 🚀 Remaining Features & Technical Implementation Blueprint

Below is the structured roadmap of features planned for future releases, complete with the detailed technical architecture required for each.

```
+-----------------------------------------------------------------------------------+
|                           PREṢAKA DEVELOPMENT ROADMAP                             |
+-----------------------------------------------------------------------------------+
|  PHASE 1: High-Priority Enhancements                                              |
|  - Image & Media Sharing              (Multer + S3/Cloudinary + Sharp)            |
|  - File & Document Attachments        (MIME validation + Download streams)        |
|  - Voice Audio Messages               (MediaRecorder + Wavesurfer.js)             |
|  - Group Conversations                (chat_members roles + multi-user events)    |
|  - In-Chat & Global Search            (PostgreSQL tsvector full-text search)      |
+-----------------------------------------------------------------------------------+
|  PHASE 2: Platform & Usability Expansions                                         |
|  - Web Push Notifications             (Web Push API + Service Worker + VAPID)     |
|  - Message Forwarding                 (Forwarding context + multi-recipient dispatch)
|  - Link Previews (OpenGraph)          (Server scraper + Redis cache)              |
|  - Conversation Muting                (muted_until column + notification filter)  |
|  - Offline Queue & Auto-Resync        (IndexedDB + Network sync worker)           |
|  - Progressive Web App (PWA)          (App manifest + Workbox caching)            |
+-----------------------------------------------------------------------------------+
|  PHASE 3: Advanced Audio/Video, Ephemeral & Security                              |
|  - WebRTC 1-to-1 Audio/Video Calling  (RTCPeerConnection + Socket.IO signaling)   |
|  - Disappearing Messages              (TTL / expires_at + pg_cron cleanup)        |
|  - End-to-End Encryption (E2EE)       (Signal Protocol / Olm-Megolm)              |
|  - 24-Hour Stories / Status           (Media stories + 24-hour expiration)        |
|  - Two-Factor Authentication (2FA)    (TOTP speakeasy + Authenticator QR code)    |
|  - AI Smart Replies & Translations    (Gemini / OpenAI API integration)           |
+-----------------------------------------------------------------------------------+
```

---

### Phase 1: High-Priority Enhancements

#### 1. Image & Media Sharing
- **User Experience**: Users can pick images from disk or drag-and-drop screenshots directly into the composer, preview them with captions, and view them full-screen via a lightbox modal.
- **Technical Aspect**:
  - **Backend**: Express upload endpoint `POST /api/messages/media/image` using `multer` with memory storage. Integrate `sharp` to validate image buffers, strip EXIF metadata, and produce two variants: a lightweight WebP thumbnail (200x200px) and an optimized viewing variant (max 1600px width). Upload to AWS S3 or Cloudinary.
  - **Database**: Store media descriptors in `messages.metadata` JSONB (`{ url, thumbnailUrl, width, height, mimeType, size }`). Set `messages.type = 'image'`.
  - **Frontend**: Drag-and-drop zone in [MessageComposer.tsx](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/pages/chat/components/MessageComposer.tsx) with client-side image compression using `browser-image-compression` before transmission.

#### 2. File & Document Attachments
- **User Experience**: Upload PDFs, spreadsheets, documents, and archives with file type icons, size badges, and single-click downloads.
- **Technical Aspect**:
  - **Backend**: `POST /api/messages/media/file` with MIME type whitelist (PDF, DOCX, XLSX, TXT, ZIP) and maximum size threshold (e.g., 25MB). Stream uploads directly to secure cloud storage using pre-signed S3 upload URLs.
  - **Database**: `messages.type = 'file'`, metadata `{ originalName, extension, size, downloadUrl }`.
  - **Frontend**: Render custom document cards with type badges and download progress indicators.

#### 3. Voice Audio Messages
- **User Experience**: Press-and-hold microphone button to record audio notes, preview waveform before sending, and listen with 1x/1.5x/2x speed controls.
- **Technical Aspect**:
  - **Frontend**: Audio capture via browser `MediaRecorder` API encoded into `audio/webm;codecs=opus` or `audio/mp4`. Render interactive waveform visuals using `wavesurfer.js`.
  - **Backend**: `POST /api/messages/media/audio`. Optional transcode to standard MP3/OGG using `ffmpeg`. Store audio in object storage.
  - **Database**: `messages.type = 'audio'`, metadata `{ durationSeconds, waveformPeaks: [] }`.

#### 4. Group Conversations & Administration
- **User Experience**: Users can create group chats, assign group titles and avatars, add/remove contacts, and manage administrator permissions.
- **Technical Aspect**:
  - **Database**: The existing schema already supports `chats.type = 'group'` and `chat_members.role IN ('admin', 'member')`! Add columns `chat_members.permissions` (e.g. can send messages, can add members).
  - **Backend**: REST endpoints:
    - `POST /api/chats/group` (Create group with initial members)
    - `POST /api/chats/:id/members` (Add members)
    - `DELETE /api/chats/:id/members/:userId` (Remove/kick member)
    - `PATCH /api/chats/:id/members/:userId/role` (Promote/demote admin)
  - **Socket Events**: Socket room `chat:<groupId>` automatically notifies members of group membership changes (`group:member-added`, `group:member-removed`).
  - **Frontend**: Multi-select user picker modal, group header showing participant count, and sender name tags on message bubbles.

#### 5. In-Chat & Global Message Search
- **User Experience**: Fast search bar in the conversation header and sidebar to quickly locate messages by keyword with search result highlighting and click-to-scroll.
- **Technical Aspect**:
  - **Database**: Add PostgreSQL GIN index on message text:
    ```sql
    CREATE INDEX idx_messages_search ON messages USING gin(to_tsvector('english', content));
    ```
  - **Backend**: `GET /api/messages/search?q=query&chatId=` executing `to_tsquery('english', $1)`.
  - **Frontend**: Match highlighting in message bubbles and smooth scroll into view via DOM `element.scrollIntoView({ behavior: 'smooth' })`.

---

### Phase 2: Platform & Usability Expansions

#### 6. Web Push Notifications
- **User Experience**: Background notifications on desktop and mobile browsers when messages arrive while the Preṣaka tab is closed or minimized.
- **Technical Aspect**:
  - **Architecture**: W3C Web Push Protocol using `web-push` library with VAPID keys.
  - **Database**: `push_subscriptions` table (`user_id`, `endpoint`, `p256dh_key`, `auth_key`, `user_agent`).
  - **Service Worker**: `sw.js` listens to the `push` event, shows notification via `self.registration.showNotification()`, and handles click events to focus or open the active conversation.

#### 7. Message Forwarding
- **User Experience**: Select one or multiple messages and forward them into another conversation or group with a single click.
- **Technical Aspect**:
  - **Backend**: `POST /api/messages/forward` taking `{ messageIds: string[], targetChatIds: string[] }`. Copies content and assets while appending `{ forwarded: true, originalSenderId }` in `metadata`.
  - **Frontend**: Checkbox selection overlay on message list with sticky action bar: "Forward (N)".

#### 8. Link Previews (OpenGraph)
- **User Experience**: Typing or receiving links (e.g. YouTube, GitHub, news) automatically displays an embedded preview card showing title, thumbnail, and domain.
- **Technical Aspect**:
  - **Backend**: Microservice endpoint `GET /api/link-preview?url=`. Fetches target HTML with timeout caps, parses OpenGraph tags (`og:title`, `og:image`, `og:description`), and caches results in Redis (`linkpreview:<hash>`) for 7 days.
  - **Frontend**: Async link card component rendered underneath the text message bubble.

#### 9. Conversation Muting
- **User Experience**: Mute notifications for noisy chats for 1 hour, 8 hours, 1 week, or indefinitely.
- **Technical Aspect**:
  - **Database**: Add `muted_until TIMESTAMP WITH TIME ZONE` to `chat_members`.
  - **Backend**: Notification dispatch pipeline checks `WHERE (muted_until IS NULL OR muted_until < NOW())` before queuing push or socket notification sounds.

#### 10. Offline Message Queue & Resynchronization
- **User Experience**: Send messages even during intermittent connectivity; messages show a pending clock icon and auto-send once network returns.
- **Technical Aspect**:
  - **Frontend**: Store unsent messages in browser `IndexedDB`. Listen to `window.addEventListener('online')` and Socket.IO `connect` events to trigger an automatic flush queue worker with exponential backoff.

#### 11. Progressive Web App (PWA)
- **User Experience**: Installable application on Windows, macOS, Android, and iOS with home screen icon, standalone window mode, and offline caching.
- **Technical Aspect**:
  - Web App Manifest (`manifest.webmanifest`) configured with `display: standalone`, branding colors, and adaptive icons.
  - Workbox Service Worker caching the production application shell (`index.html`, CSS, JS bundles).

---

### Phase 3: Real-Time Audio/Video & Deep Security

#### 12. WebRTC 1-to-1 Voice & Video Calls
- **User Experience**: High-definition browser-to-browser voice and video calling with mic mute, video toggle, screen sharing, and audio ringtones.
- **Technical Aspect**:
  - **Signaling**: Leverage existing Socket.IO connection for WebRTC signaling:
    - `call:initiate` / `call:incoming`
    - `call:signal` (SDP offer / answer exchange)
    - `call:ice-candidate` (ICE network routing)
    - `call:end` / `call:reject`
  - **Media Stream**: Browser `navigator.mediaDevices.getUserMedia()` attached to `RTCPeerConnection`.
  - **STUN/TURN**: Configured with free Google STUN servers for NAT traversal and Coturn TURN server for symmetric NAT environments.

#### 13. Disappearing Messages
- **User Experience**: Configurable per-chat ephemeral messaging where messages automatically vanish 24 hours or 7 days after reading.
- **Technical Aspect**:
  - **Database**: Add `expires_at TIMESTAMP WITH TIME ZONE` to `messages`.
  - **Backend**: Scheduled worker (via `pg_cron` or Node.js scheduler) executes:
    ```sql
    UPDATE messages SET deleted_at = CURRENT_TIMESTAMP WHERE expires_at <= NOW() AND deleted_at IS NULL;
    ```
  - Emits socket deletion events to connected clients.

#### 14. End-to-End Encryption (E2EE)
- **User Experience**: Uncompromising privacy where only chat participants can decrypt content; neither the server nor database administrators can view messages.
- **Technical Aspect**:
  - Implement the **Double Ratchet / Signal Protocol** via `libsignal-protocol-javascript`.
  - Identity keys, signed pre-keys, and one-time pre-keys generated client-side and saved in browser IndexedDB.
  - Public keys published to the server; ciphertexts transmitted through server without plaintext inspection.

#### 15. Status / Stories (24-Hour Ephemeral Posts)
- **User Experience**: Share photos and updates with contacts that vanish after 24 hours (UI foundation already laid in [StatusTab.tsx](file:///d:/01.%20learnings/react-learning/presaka/frontend/src/components/layout/sidebar/StatusTab.tsx)).
- **Technical Aspect**:
  - `stories` table (`id`, `user_id`, `media_url`, `caption`, `created_at`, `expires_at`).
  - Full-screen story viewer with progress segment indicators and swipe navigation.

#### 16. Two-Factor Authentication (2FA)
- **User Experience**: Optional secondary verification step using Authenticator apps (Google Authenticator, Authy, 1Password) upon login.
- **Technical Aspect**:
  - Backend integration with `speakeasy` to generate TOTP secret and QR code via `qrcode`.
  - Encrypted storage of TOTP secrets in PostgreSQL with one-time backup recovery codes.

#### 17. AI Smart Replies & Translation
- **User Experience**: Instant contextual reply chips and real-time message translation into regional Indian languages (Hindi, Marathi, Tamil, Bengali, Telugu, etc.) and global languages.
- **Technical Aspect**:
  - Integration with Google Gemini API (`@google/genai`).
  - Real-time message translation pipeline caching translations in Redis to minimize API round-trips.

---

## 🛠 Tech Stack Overview

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, TypeScript 5.9 | Reactive UI, strict type safety, modular component hierarchy |
| **Build Tool & Bundler** | Vite 5 | Instant HMR, ESM bundling, optimized production builds |
| **State Management** | Redux Toolkit 2.11, Redux Persist | Centralized auth, chat, and UI state with local storage persistence |
| **Styling & Animation** | Tailwind CSS 3.4, Framer Motion 12 | Utility-first responsive design, dark mode, smooth spring animations |
| **Real-Time Client** | Socket.IO Client 4.6 | Bidirectional low-latency WebSocket communication |
| **Backend Runtime** | Node.js (ESM), Express 4.18 | REST API routing, middleware pipeline, application server |
| **Real-Time Server** | Socket.IO 4.6 | Room clustering, connection heartbeats, event broadcast |
| **Relational Database** | PostgreSQL 14+ with UUID extension | ACID storage for users, chats, messages, receipts, privacy blocks |
| **In-Memory Cache** | Redis 6+ (`redis` v4.6) | High-speed cache for OTP verification, active presence, typing TTL |
| **Security & Utilities** | JWT, BcryptJS, Helmet, CORS, Morgan, Winston | Token signing, password hashing, security headers, structured logging |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **PostgreSQL**: `>= 14`
- **Redis**: `>= 6.0`

### 1. Clone the Repository
```bash
git clone https://github.com/abhinish-tiwari/presaka_chat_application.git
cd presaka
```

### 2. Automated Setup (Recommended)
Preṣaka provides turn-key setup automation scripts in the `scripts/` directory:

- **Windows**:
  ```cmd
  .\scripts\setup.bat
  ```
- **Linux / macOS**:
  ```bash
  chmod +x scripts/*.sh
  ./scripts/setup.sh
  ```

### 3. Manual Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials, Redis host, and JWT secrets
```

#### Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Defaults point to http://localhost:3000 (Backend) and http://localhost:3000 (WebSocket)
```

#### Database Initialization
```bash
# Create database
createdb presaka

# Execute initial schema
psql -d presaka -f backend/src/database/schema.sql

# Execute conversation actions migration (clears & blocks)
psql -d presaka -f backend/src/database/migrations/20260212_conversation_actions.sql
```

### 4. Running the Development Servers

- **Run Everything (Windows)**:
  ```cmd
  .\scripts\start-all.bat
  ```
- **Run Everything (Linux / macOS)**:
  ```bash
  ./scripts/start-all.sh
  ```

Or run manually in separate terminals:
- **Terminal 1**: `redis-server`
- **Terminal 2**: `cd backend && npm run dev` (Runs on `http://localhost:3000`)
- **Terminal 3**: `cd frontend && npm run dev` (Runs on `http://localhost:5173`)

Open [http://localhost:5173](http://localhost:5173) in your browser.

> [!NOTE]
> During development, if `SMS_ENABLED=false` in `backend/.env`, OTP codes are output directly to the backend terminal console for instant login.

---

## 💾 Database Schema & Migrations

Preṣaka uses PostgreSQL with UUID primary keys.

```
                      +-------------------+
                      |       users       |
                      +-------------------+
                      | id (UUID, PK)     |
                      | phone (VARCHAR)   |
                      | name (VARCHAR)    |
                      | avatar_url (TEXT) |
                      | bio (TEXT)        |
                      | is_verified (BOOL)|
                      | last_seen (TIMEST)|
                      +---------+---------+
                                |
          +---------------------+---------------------+
          |                                           |
+---------v---------+                       +---------v---------+
|    chat_members   |                       |    user_blocks    |
+-------------------+                       +-------------------+
| chat_id (UUID, FK)|                       | blocker_id (UUID) |
| user_id (UUID, FK)|                       | blocked_id (UUID) |
| role (admin/member|                       +-------------------+
| joined_at (TIMEST)|
| left_at (TIMEST)  |
+---------+---------+
          |
+---------v---------+       +-------------------+       +-------------------+
|       chats       |<------+     messages      |<------+  message_receipts |
+-------------------+       +-------------------+       +-------------------+
| id (UUID, PK)     |       | id (UUID, PK)     |       | message_id (UUID) |
| type (priv/group) |       | chat_id (UUID, FK)|       | user_id (UUID, FK)|
| name (VARCHAR)    |       | sender_id (UUID)  |       | delivered_at (TS) |
| created_by (UUID) |       | content (TEXT)    |       | read_at (TIMEST)  |
+---------^---------+       | reply_to_id (UUID)|       +-------------------+
          |                 | metadata (JSONB)  |
+---------+---------+       | deleted_at (TS)   |
|    chat_clears    |       +-------------------+
+-------------------+
| chat_id (UUID, FK)|
| user_id (UUID, FK)|
| cleared_at (TIMEST|
+-------------------+
```

---

## 📚 Documentation Index

Comprehensive guides and architectural deep dives are maintained in the [`docs/`](docs) directory:

- **Setup & Deployment**:
  - [Quick Start Guide](docs/setup/QUICK_START.md) — Step-by-step local workstation configuration.
  - [Production Deployment](docs/setup/DEPLOYMENT.md) — Production hardening, Nginx configuration, SSL, and PM2.
  - [SMS Setup Guide](docs/setup/SMS_SETUP_GUIDE.md) — MSG91 and Twilio carrier integration.
- **APIs & Protocols**:
  - [REST API Specification](docs/api/API.md) — Endpoints, payloads, and response contracts.
  - [WebSocket Protocol](docs/api/WEBSOCKET.md) — Socket.IO events, payloads, and error codes.
  - [Authentication Flow](docs/api/AUTHENTICATION.md) — OTP security, JWT lifecycle, and refresh mechanics.
- **Architecture & Technical Design**:
  - [System Architecture](docs/architecture/ARCHITECTURE.md) — Core architectural blueprint.
  - [Database Architecture](docs/architecture/DATABASE.md) — Entity-relationship diagrams and index design.
  - [Security Architecture](docs/architecture/SECURITY.md) — Threat models and data protection practices.
  - [Documentation Map](docs/DOCUMENTATION_MAP.md) — Full index of all documentation assets.
- **Automation Scripts**:
  - [Scripts Documentation](scripts/README.md) — Usage guide for all utility scripts (`setup`, `clean`, `db-reset`, `start-all`).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

**Preṣaka (प्रेषक)** — *Built with trust, rooted in culture, ready for global scale 🚀*
