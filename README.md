# PahadiMatch - Premium Matrimonial Platform

<div align="center">
  <img src="public/favicon.svg" alt="PahadiMatch Logo" width="80" height="80">
  <h3>Where Mountains Meet Hearts ❤️</h3>
  <p>A modern, scalable matrimonial platform for the Pahadi community</p>
</div>

---

## 🚀 Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Custom Wedding Theme
- **UI Components:** Radix UI (shadcn/ui style)
- **State Management:** Redux Toolkit + RTK Query
- **Routing:** React Router v6
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Card, etc.)
│   ├── layout/          # Layout components (Header, Sidebar, DashboardLayout)
│   └── shared/          # Shared components (ProfileCard, EmptyState, ErrorBoundary)
├── features/            # Feature-based modules
│   ├── auth/            # Authentication (Login, Signup, OTP)
│   ├── dashboard/       # Dashboard page
│   ├── profile/         # Profile management
│   ├── search/          # Search & filters
│   ├── matches/         # Match categories
│   ├── activity/        # Activity center (interests, shortlist)
│   ├── chat/            # Messaging module
│   └── membership/      # Membership & payments
├── store/
│   ├── api/             # RTK Query API slices
│   ├── slices/          # Redux slices (auth, ui)
│   ├── hooks.ts         # Typed Redux hooks
│   └── index.ts         # Store configuration
├── types/               # TypeScript interfaces
├── lib/                 # Utilities
├── App.tsx              # Main app with routing
└── index.css            # Global styles & theme
```

## 🎨 Design System

### Color Palette (Wedding Theme)

- **Primary:** Rose/Magenta (#B8336A)
- **Accent:** Gold (#D4AF37)
- **Secondary:** Deep Maroon (#722F37)
- **Background:** Warm Cream (#FFFBF7)

### Typography

- **Primary Font:** Poppins (body text)
- **Display Font:** Playfair Display (headings)
- **Script Font:** Great Vibes (decorative)

## 🔧 Setup & Installation

```bash
# Clone the repository
git clone <repo-url>
cd pm-ui

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 3001) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔌 API Integration

The app uses RTK Query for API calls. All endpoints are defined in `src/store/api/`:

- `authApi.ts` - Authentication (OTP, login, signup)
- `profileApi.ts` - Profile CRUD operations
- `photoApi.ts` - Photo management
- `searchApi.ts` - Search with filters
- `matchApi.ts` - Match categories
- `activityApi.ts` - Interests, shortlist, block
- `chatApi.ts` - Messaging
- `membershipApi.ts` - Plans & subscriptions
- `notificationApi.ts` - Notifications
- `kundaliApi.ts` - Kundali matching

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Touch-friendly interactions

## 🔐 Authentication Flow

1. **Login/Signup** → Enter phone number
2. **OTP Verification** → 6-digit code
3. **New Users** → Redirect to profile completion
4. **Existing Users** → Redirect to dashboard

## 📦 Key Features

### ✅ Implemented

- [x] Phone OTP authentication
- [x] Dashboard with stats & quick actions
- [x] Profile search with advanced filters
- [x] 17 match categories
- [x] Activity center (interests, shortlist, blocked)
- [x] Real-time chat UI
- [x] Membership plans & upgrade flow
- [x] Toast notifications
- [x] Protected routes
- [x] Responsive layout

### 🚧 To Be Implemented

- [ ] Complete profile edit wizard
- [ ] Photo upload with drag & drop
- [ ] Razorpay payment integration
- [ ] WebSocket real-time chat
- [ ] Push notifications
- [ ] Kundali matching

## 🛡️ Security

- JWT token authentication
- Protected routes
- Auto-logout on token expiry
- Rate limiting awareness
- Input validation with Zod

## 🎯 Performance Optimizations

- RTK Query caching
- Lazy loading routes (can be added)
- Image optimization
- Skeleton loaders
- Memoized components

## 📄 Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=your_key_id
```

## 🤝 Contributing

1. Follow feature-based architecture
2. Use TypeScript strictly
3. Follow the existing coding style
4. Test components thoroughly
5. Update documentation

## 📜 License

Private - All Rights Reserved

---

<div align="center">
  Made with ❤️ for the Pahadi community
</div>
