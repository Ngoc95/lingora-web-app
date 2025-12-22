# Lingora Web Application - Full Technical Specification
> **Version**: 3.0 (Complete Spec for Development)
> **Stack**: Next.js 14, TypeScript, Tailwind CSS, Zustand, TanStack Query
> **Updated**: December 2024

---

## Table of Contents
1. [Design System](#1-design-system)
2. [TypeScript Interfaces (DTOs)](#2-typescript-interfaces)
3. [API Services](#3-api-services)
4. [Custom Hooks](#4-custom-hooks)
5. [Auth Module](#5-auth-module)
6. [User Module](#6-user-module)
7. [Admin Module](#7-admin-module)
8. [Folder Structure](#8-folder-structure)

---

## 1. Design System

### 1.1 Color Palette
From `core/ui/theme/Color.kt`:

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Primary Green | `#00BC7D` | `--primary` | Buttons, Active states |
| Primary Teal | `#00BBA7` | `--primary-light` | Gradients, Hover |
| Dark Green | `#00A63E` | `--primary-dark` | Pressed states |
| Dark Teal | `#009689` | `--secondary` | Accents |
| Main Text | `#0A0A0A` | `--text-primary` | Headings, Body |
| Sub Text | `#4A5565` | `--text-secondary` | Captions, Placeholders |
| Border | `#F3F4F6` | `--border` | Dividers, Card outlines |

### 1.2 Tailwind Config
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#00BC7D', light: '#00BBA7', dark: '#00A63E' },
        secondary: '#009689',
        neutral: { 900: '#0A0A0A', 600: '#4A5565', 100: '#F3F4F6' }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00BC7D 0%, #00BBA7 100%)',
      }
    }
  }
}
```

---

## 2. TypeScript Interfaces

### 2.1 Auth Interfaces
```typescript
// types/auth.ts
interface IUser {
  id: number;
  username: string;
  email: string;
  roles: IRole[];
  avatar?: string;
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
  proficiency?: string; // e.g., "B1"
  createdAt?: string;
}

interface IRole {
  id: number;
  name: 'ADMIN' | 'LEARNER';
}

interface ILoginRequest {
  usernameOrEmail: string;
  password: string;
}

interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface IAuthResponse {
  accessToken: string;
  user: IUser;
}
```

### 2.2 Vocabulary Interfaces
```typescript
// types/vocabulary.ts
interface ICategory {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

interface ITopic {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

interface IWord {
  id: number;
  topicId: number;
  word: string;
  phonetic?: string;
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  type?: string; // noun, verb, etc.
  meaning?: string;
  vnMeaning?: string;
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
  imageUrl?: string;
}
```

### 2.3 Exam Interfaces
```typescript
// types/exam.ts
interface IExam {
  id: number;
  examType: 'IELTS' | 'TOEIC' | 'TOEFL';
  code: string;
  title: string;
  isPublished: boolean;
  metadata?: Record<string, any>;
  sections?: IExamSection[];
}

interface IExamSection {
  id: number;
  sectionType: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
  title?: string;
  durationSeconds?: number;
  instructions?: string;
  audioUrl?: string;
  status?: 'NOT_STARTED' | 'COMPLETED';
  groups?: IExamSectionGroup[];
}

interface IExamSectionGroup {
  id: number;
  groupType: string;
  title?: string;
  description?: string;
  content?: string; // HTML/Markdown for reading passages
  resourceUrl?: string;
  questionGroups?: IExamQuestionGroup[];
}

interface IExamQuestionGroup {
  id: number;
  title?: string;
  description?: string;
  content?: string;
  questions?: IExamQuestion[];
}

interface IExamQuestion {
  id: number;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'MATCHING' | 'ESSAY' | 'RECORDING';
  prompt: string;
  options?: string[] | { key: string; value: string }[];
  correctAnswer?: any;
  explanation?: string;
}

// For submissions
interface ISubmitAnswer {
  questionId: number;
  answer: string | string[] | null;
}

interface IExamAttempt {
  id: number;
  examId: number;
  mode: 'FULL_TEST' | 'PRACTICE';
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt?: string;
  submittedAt?: string;
  scoreSummary?: IScoreSummary;
}

interface IScoreSummary {
  overallBand?: number;
  overallScore?: number;
  sections?: Record<string, { band?: number; correct?: number; total?: number }>;
}
```

### 2.4 StudySet Interfaces
```typescript
// types/studyset.ts
interface IStudySet {
  id: number;
  title: string;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  price: number; // 0 = free
  status: 'ACTIVE' | 'DELETED';
  likeCount: number;
  commentCount?: number;
  owner: { id: number; username: string };
  flashcards?: IFlashcard[];
  quizzes?: IQuiz[];
  isPurchased?: boolean;
  isAlreadyLike?: boolean;
  createdAt: string;
}

interface IFlashcard {
  id?: number;
  frontText: string;
  backText: string;
  example?: string;
  audioUrl?: string;
  imageUrl?: string;
}

interface IQuiz {
  id?: number;
  type: 'MULTIPLE_CHOICE';
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ICreateStudySetRequest {
  title: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  price?: number;
  flashcards: IFlashcard[];
  quizzes?: IQuiz[];
}
```

### 2.5 Forum Interfaces
```typescript
// types/forum.ts
interface IPost {
  id: number;
  title: string;
  content: string;
  topic?: string;
  tags?: string[];
  status: 'ACTIVE' | 'DELETED';
  likeCount: number;
  commentCount: number;
  owner: { id: number; username: string; avatar?: string };
  isAlreadyLike?: boolean;
  createdAt: string;
}

interface IComment {
  id: number;
  content: string;
  parentId?: number;
  owner: { id: number; username: string };
  likeCount: number;
  isAlreadyLike?: boolean;
  createdAt: string;
  childrenCount?: number;
}

interface ICreatePostRequest {
  title: string;
  content: string;
  topic?: string;
  tags?: string[];
}
```

### 2.6 Chatbot Interfaces
```typescript
// types/chatbot.ts
interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface IChatSession {
  sessionId: string;
  title?: string;
  lastMessage?: string;
  createdAt: string;
}

interface IChatSendRequest {
  message: string;
  sessionId?: string; // null = new session
}
```

---

## 3. API Services

### 3.1 Auth API
| Method | Endpoint | Request | Response | Description |
|--------|----------|---------|----------|-------------|
| POST | `/auth/login` | `ILoginRequest` | `IAuthResponse` | Login |
| POST | `/auth/register` | `IRegisterRequest` | `IAuthResponse` | Register |
| POST | `/auth/verify-otp` | `{ email, otp }` | `{ message }` | Verify OTP |
| POST | `/auth/resend-otp` | `{ email }` | `{ message }` | Resend OTP |
| POST | `/auth/refresh-token` | - | `{ accessToken }` | Refresh JWT |
| POST | `/auth/logout` | - | `{ message }` | Logout |
| GET | `/auth/me` | - | `IUser` | Get profile |

### 3.2 Vocabulary API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress/categories?page&limit&search` | Categories with learning progress |
| GET | `/progress/categories/{id}/topics?page&limit` | Topics in a category |
| GET | `/progress/topics/{id}/words?limit&hasLearned` | Words in a topic |
| GET | `/progress/topics/{id}/study?count` | Get words for study session |
| GET | `/progress/review?limit&page` | Get words due for review |
| POST | `/progress` | Create word progress |
| PATCH | `/progress` | Update word progress (after answering) |
| GET | `/words/suggest?term&limit` | Autocomplete suggestions |
| GET | `/words/dictionary?term` | Dictionary lookup |

### 3.3 Exam API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exams?examType&isPublished&search&page&limit` | List exams |
| GET | `/exams/{id}` | Exam detail (with sections) |
| GET | `/exams/{id}/sections/{sectionId}` | Section detail (with questions) |
| POST | `/exams/{id}/start` | Start attempt `{ mode, sectionId?, resumeLast? }` |
| POST | `/exam-attempts/{id}/sections/{sectionId}/submit` | Submit section answers |
| POST | `/exam-attempts/{id}/submit` | Finalize full test |
| GET | `/exam-attempts?page&limit` | User's attempt history |
| GET | `/exam-attempts/{id}` | Attempt detail with answers & feedback |

### 3.4 StudySet API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/studysets?page&limit&search&visibility&minPrice&maxPrice` | List all public sets |
| GET | `/studysets/own?page&limit` | My study sets |
| GET | `/studysets/{id}` | StudySet detail |
| POST | `/studysets` | Create study set |
| PATCH | `/studysets/{id}` | Update study set |
| DELETE | `/studysets/{id}` | Delete study set |
| POST | `/studysets/{id}/buy` | Purchase -> Returns `{ paymentUrl, isFree }` |
| POST | `/vnpay/return` | Verify VNPay payment |

### 3.5 Forum API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts?page&search&topic&tags&status` | List posts |
| GET | `/posts/{id}` | Post detail |
| POST | `/posts` | Create post |
| PATCH | `/posts/{id}` | Update post |
| DELETE | `/posts/{id}` | Delete post |
| POST | `/likes/{targetId}?targetType` | Like (POST/COMMENT/STUDYSET) |
| DELETE | `/likes/{targetId}?targetType` | Unlike |
| GET | `/comments/target/{targetId}/parent/{parentId}?targetType` | Get comments |
| POST | `/comments/target/{targetId}?targetType` | Create comment |
| DELETE | `/comments/{id}` | Delete comment |

### 3.6 Chatbot API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Send message `{ message, sessionId? }` |
| GET | `/chat/sessions` | List chat sessions |
| GET | `/chat/sessions/{id}/messages` | Get session messages |
| DELETE | `/chat/sessions/{id}` | Delete session |

---

## 4. Custom Hooks

| Hook | Purpose | Key Returns |
|------|---------|-------------|
| `useAuth()` | Auth state & actions | `user`, `login()`, `logout()`, `isAuthenticated` |
| `useAudioPlayer(url)` | Audio playback | `playing`, `currentTime`, `duration`, `play()`, `pause()`, `seekTo()` |
| `useVoiceRecorder()` | Mic recording | `isRecording`, `audioBlob`, `start()`, `stop()` |
| `useCountdown(seconds)` | Exam timer | `timeLeft`, `formattedTime`, `isExpired` |
| `useExamSession()` | Exam state management | `answers`, `setAnswer()`, `markedForReview`, `submitSection()` |
| `useFlashcard()` | Flashcard flip state | `isFlipped`, `flip()`, `next()`, `prev()`, `progress` |
| `useInfiniteScroll(fetchFn)` | Pagination for lists | `items`, `loadMore`, `hasMore`, `isLoading` |

---

## 5. Auth Module

### Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `LoginPage` | Email/Username + Password form |
| `/register` | `RegisterPage` | Username, Email, Password, Confirm |
| `/otp?email=` | `OTPPage` | 6-digit input, Resend button |
| `/adaptive-test` | `AdaptiveTestPage` | Initial proficiency questionnaire |

### Screen: Login/Register
```
┌─────────────────────────────────────┐
│          [LINGORA LOGO]             │
├─────────────────────────────────────┤
│  [Login]  [Register]  <- Tabs       │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ Email or Username           │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Password                    │    │
│  └─────────────────────────────┘    │
│  [        LOGIN BUTTON         ]    │
│  ----------- OR -----------         │
│  [     Google Sign In          ]    │
└─────────────────────────────────────┘
```

---

## 6. User Module

### 6.1 Layout Structure
```
┌───────────────────────────────────────────────┐
│ TopBar: [Title]              [🔔 Notifications]│
├───────────────────────────────────────────────┤
│                                               │
│              PAGE CONTENT                     │
│                                               │
├───────────────────────────────────────────────┤
│ BottomNav: [Vocab] [Practice] [Sets] [Dict] [Forum] [Profile] │
└───────────────────────────────────────────────┘
                                            [💬 FAB -> Chatbot]
```

### 6.2 Vocabulary Module

#### Screen: Categories List (`/vocabulary`)
```
┌─────────────────────────────────────┐
│ Category Card                       │
│ ┌─────┐  Category Name              │
│ │ IMG │  Progress: 45/100 words     │
│ └─────┘  [=======>        ] 45%     │
└─────────────────────────────────────┘
(Repeat for each category)
```
**Components**: `CategoryCard`, `ProgressBar`

#### Screen: Topic List (`/vocabulary/category/[id]`)
```
┌─────────────────────────────────────┐
│ [🔙]  Category Name                 │
├─────────────────────────────────────┤
│ Topic Card                          │
│   Topic Name                        │
│   15 words | 10 learned             │
│   [===============>   ] 66%         │
└─────────────────────────────────────┘
(Repeat for each topic)
```

#### Screen: Topic Detail (`/vocabulary/topic/[id]`)
```
┌─────────────────────────────────────┐
│ [🔙]  Topic Name                    │
├─────────────────────────────────────┤
│ Description text here...            │
├─────────────────────────────────────┤
│ Word Count Selector: [10] [15] [20] │
├─────────────────────────────────────┤
│ Game Types (Checkboxes):            │
│ ✅ Listen & Fill                   │
│ ✅ Listen & Choose                 │
│ ✅ True/False                      │
│ ✅ See Word → Choose Meaning       │
│ ✅ See Meaning → Choose Word       │
├─────────────────────────────────────┤
│ [      START LEARNING       ]       │
└─────────────────────────────────────┘
```

#### Screen: Learn Word (`/vocabulary/learn/[topicId]`)
Game types cycle randomly. Example for "Listen & Choose":
```
┌─────────────────────────────────────┐
│ Progress: 5/15                      │
├─────────────────────────────────────┤
│          🔊 [PLAY AUDIO]            │
│                                     │
│ Choose the correct word:            │
│                                     │
│   [  Option A  ]  [  Option B  ]    │
│   [  Option C  ]  [  Option D  ]    │
├─────────────────────────────────────┤
│            [SKIP]                   │
└─────────────────────────────────────┘
```

### 6.3 Exam Module

#### Screen: Practice Home (`/practice`)
```
┌─────────────────────────────────────┐
│ Feature Cards:                      │
│ ┌───────────┐ ┌───────────┐         │
│ │ Pronunc.  │ │ Test Prac │         │
│ │ 🎙️        │ │ 📝        │         │
│ └───────────┘ └───────────┘         │
│ ┌───────────┐ ┌───────────┐         │
│ │ Vocab Rev │ │ Custom Rev│         │
│ │ 📖        │ │ 🔄        │         │
│ └───────────┘ └───────────┘         │
└─────────────────────────────────────┘
```

#### Screen: Test List (`/practice/tests`)
```
┌─────────────────────────────────────┐
│ Exam Card                           │
│ ┌─────┐  IELTS Practice Test 1      │
│ │IELTS│  4 sections                 │
│ └─────┘  [Start Full Test]          │
└─────────────────────────────────────┘
```

#### Screen: Test Detail (`/tests/[id]`)
```
┌─────────────────────────────────────┐
│ [🔙]  IELTS Practice Test 1         │
├─────────────────────────────────────┤
│ Sections:                           │
│   🎧 Listening  - 40 min            │
│   📖 Reading    - 60 min            │
│   ✍️ Writing    - 60 min            │
│   🎙️ Speaking   - 15 min            │
├─────────────────────────────────────┤
│ Mode Selection:                     │
│   ○ Full Test (all sections)        │
│   ○ Practice (single section)       │
├─────────────────────────────────────┤
│ [      START EXAM       ]           │
└─────────────────────────────────────┘
```

#### Screen: Listening Practice (`/tests/[id]/listening`)
```
┌─────────────────────────────────────┐
│ Timer: 39:45  |  Part 1 of 4        │
├─────────────────────────────────────┤
│ Audio Player:                       │
│ [▶️ 00:45 ─────●───── 03:20]        │
├─────────────────────────────────────┤
│ Question 1:                         │
│ What is the speaker's occupation?   │
│   ○ A) Teacher                      │
│   ○ B) Engineer                     │
│   ● C) Doctor (selected)            │
│   ○ D) Lawyer                       │
├─────────────────────────────────────┤
│ [◄ Prev]  Q1 Q2 Q3 Q4...  [Next ►]  │
├─────────────────────────────────────┤
│ [         SUBMIT SECTION          ] │
└─────────────────────────────────────┘
```

#### Screen: Reading Practice (`/tests/[id]/reading`)
Split layout:
```
┌──────────────────────┬──────────────────────┐
│ PASSAGE              │ QUESTIONS            │
│                      │                      │
│ Lorem ipsum dolor... │ Q1: What is the...   │
│ Paragraph 2...       │   ○ A) ...           │
│                      │   ● B) ... (selected)│
│ [Scroll]             │   ○ C) ...           │
│                      │                      │
│                      │ Q2: Fill in the blank│
│                      │ [ _________ ]        │
└──────────────────────┴──────────────────────┘
```

### 6.4 StudySet Module

#### Screen: StudySet List (`/study-sets`)
```
┌─────────────────────────────────────┐
│ Tabs: [All] [My Sets] [Purchased]   │
├─────────────────────────────────────┤
│ StudySet Card                       │
│   📚 English Vocabulary 500         │
│   by @john_doe                      │
│   50 cards | 💰 FREE                │
│   ❤️ 125 likes                      │
└─────────────────────────────────────┘
(Grid layout on desktop)
```

#### Screen: StudySet Detail (`/study-sets/[id]`)
```
┌─────────────────────────────────────┐
│ [🔙]  English Vocabulary 500        │
│ by @john_doe                        │
├─────────────────────────────────────┤
│ Description: Learn 500 common...    │
├─────────────────────────────────────┤
│ Stats: 50 cards | ❤️ 125 | 💬 32    │
├─────────────────────────────────────┤
│ [🃏 FLASHCARD]  [📝 QUIZ]  [Edit]   │
├─────────────────────────────────────┤
│ Preview:                            │
│ ┌───────┐ ┌───────┐ ┌───────┐       │
│ │ Card1 │ │ Card2 │ │ Card3 │       │
│ └───────┘ └───────┘ └───────┘       │
├─────────────────────────────────────┤
│ Comments Section                    │
└─────────────────────────────────────┘
```

#### Screen: Flashcard Mode (`/study-sets/[id]/flashcard`)
```
┌─────────────────────────────────────┐
│ Progress: 12/50                     │
├─────────────────────────────────────┤
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │        HELLO                │   │
│   │        /həˈloʊ/             │   │
│   │                             │   │
│   │     (Tap to flip)           │   │
│   └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│   [◄ Prev]            [Next ►]      │
└─────────────────────────────────────┘
```

---

## 7. Admin Module

### 7.1 Layout Structure
```
┌───────────────────────────────────────────────────────────┐
│ TopBar: [☰ Menu]  Admin Panel          [🔔] [👤 Admin]   │
├────────────────┬──────────────────────────────────────────┤
│ Sidebar:       │                                          │
│ 📊 Dashboard   │         PAGE CONTENT                     │
│ 👥 Users       │                                          │
│ 📚 Categories  │                                          │
│ 📁 Topics      │                                          │
│ 📝 Words       │                                          │
│ 📋 Exams       │                                          │
│ 🚩 Reports     │                                          │
│ 💰 Withdrawals │                                          │
│ ─────────────  │                                          │
│ 🔄 Switch User │                                          │
│ 🚪 Logout      │                                          │
└────────────────┴──────────────────────────────────────────┘
```

### 7.2 Dashboard (`/admin/dashboard`)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Total Users │  Total Exams │  Active Sets │  Revenue     │
│     1,234    │      45      │     678      │  $12,345     │
└──────────────┴──────────────┴──────────────┴──────────────┘
┌────────────────────────────────────────────────────────────┐
│ Charts: User Growth, Exam Attempts by Month, etc.          │
└────────────────────────────────────────────────────────────┘
```

### 7.3 User Management (`/admin/users`)
```
┌────────────────────────────────────────────────────────────┐
│ [Search: ____________________]  [Filter: Status ▼]  [+ Add]│
├────────────────────────────────────────────────────────────┤
│ | ID | Username | Email           | Status | Actions      │
│ | 1  | johndoe  | john@email.com  | ACTIVE | [Edit][Ban]  │
│ | 2  | janedoe  | jane@email.com  | BANNED | [Edit][Unban]│
├────────────────────────────────────────────────────────────┤
│ Pagination: [< 1 2 3 4 5 >]                                │
└────────────────────────────────────────────────────────────┘
```

### 7.4 Exam Management (`/admin/exams`)
```
┌────────────────────────────────────────────────────────────┐
│ [Search]  [Type: All ▼]  [Published: All ▼]  [Import JSON] │
├────────────────────────────────────────────────────────────┤
│ | ID | Title            | Type  | Published | Actions     │
│ | 1  | IELTS Test 1     | IELTS | ✅        | [View][Del] │
│ | 2  | TOEIC Practice   | TOEIC | ❌        | [View][Del] │
├────────────────────────────────────────────────────────────┤
│ Tabs: [Exams] [Attempts]                                   │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Folder Structure

```bash
/src
├── app/                           # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── otp/page.tsx
│   │   └── adaptive-test/page.tsx
│   ├── (user)/
│   │   ├── layout.tsx             # User layout with BottomNav
│   │   ├── vocabulary/
│   │   │   ├── page.tsx           # Categories
│   │   │   └── [categoryId]/
│   │   │       ├── page.tsx       # Topics
│   │   │       └── [topicId]/page.tsx # Topic Detail
│   │   ├── learn/[topicId]/page.tsx # Game Engine
│   │   ├── practice/
│   │   │   ├── page.tsx           # Practice home
│   │   │   └── tests/
│   │   │       └── [testId]/
│   │   │           ├── page.tsx   # Test detail
│   │   │           ├── listening/page.tsx
│   │   │           ├── reading/page.tsx
│   │   │           ├── writing/page.tsx
│   │   │           └── speaking/page.tsx
│   │   ├── attempts/[attemptId]/page.tsx
│   │   ├── study-sets/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── flashcard/page.tsx
│   │   │       └── quiz/page.tsx
│   │   ├── forum/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [postId]/page.tsx
│   │   ├── dictionary/page.tsx
│   │   ├── chatbot/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── profile/
│   │       ├── page.tsx
│   │       └── withdrawals/page.tsx
│   └── (admin)/
│       ├── layout.tsx             # Admin layout with Sidebar
│       ├── dashboard/page.tsx
│       ├── users/
│       │   ├── page.tsx
│       │   ├── create/page.tsx
│       │   └── [id]/page.tsx
│       ├── categories/
│       │   ├── page.tsx
│       │   └── [id]/topics/page.tsx
│       ├── topics/
│       │   ├── page.tsx
│       │   └── [id]/words/page.tsx
│       ├── words/page.tsx
│       ├── exams/
│       │   ├── page.tsx
│       │   ├── [id]/page.tsx
│       │   └── attempts/[id]/page.tsx
│       ├── reports/page.tsx
│       └── withdrawals/page.tsx
├── components/
│   ├── ui/                        # Primitives (Button, Input, Card, Modal)
│   ├── layouts/
│   │   ├── UserLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── BottomNav.tsx
│   │   └── AdminSidebar.tsx
│   └── features/
│       ├── auth/                  # LoginForm, RegisterForm
│       ├── vocabulary/            # CategoryCard, TopicCard, GameEngine
│       ├── exam/                  # QuestionCard, AudioPlayer, Timer, ResultChart
│       ├── studyset/              # FlashcardCarousel, QuizEngine
│       ├── forum/                 # PostCard, CommentSection
│       └── admin/                 # DataTable, ImportModal
├── lib/
│   ├── api/
│   │   ├── client.ts              # Axios instance
│   │   ├── auth.ts
│   │   ├── vocabulary.ts
│   │   ├── exam.ts
│   │   ├── studyset.ts
│   │   ├── forum.ts
│   │   └── chatbot.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAudioPlayer.ts
│   │   ├── useVoiceRecorder.ts
│   │   ├── useCountdown.ts
│   │   ├── useExamSession.ts
│   │   └── useInfiniteScroll.ts
│   └── utils.ts
├── stores/
│   ├── authStore.ts
│   └── examSessionStore.ts
└── types/
    ├── auth.ts
    ├── vocabulary.ts
    ├── exam.ts
    ├── studyset.ts
    ├── forum.ts
    └── chatbot.ts
```

---

## End of Specification
