# Seat Booking System - Next.js Edition

Successfully migrated from TanStack Start to **Next.js 16** with full-stack React.

## Quick Start

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
seatbookingsystem/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with auth provider
│   │   ├── page.tsx             # Home/landing page
│   │   ├── globals.css          # Global styles + Tailwind
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   └── events/
│   │       ├── page.tsx         # Events listing
│   │       └── [id]/
│   │           └── book/
│   │               └── page.tsx # Seat booking interface
│   └── lib/
│       ├── auth.tsx             # Auth context & hooks
│       ├── mockData.ts          # Mock events & venues
│       └── utils.ts             # Utility functions
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
└── .gitignore
```

## Key Features

### 🎫 Seat Booking Grid

- **12 rows × 14 columns** with aisle separator
- Row zones: VIP (A-D), EXECUTIVE (E-F), GENERAL (G-M)
- 4 seat states: available, selected, locked, taken
- Real-time price calculation with 18% GST

### 👥 Role-Based Access

- **CITIZEN**: Access to General seating (Rows E-M)
- **EXECUTIVE**: Access to General + Executive (Rows C-M)
- **VIP**: Full access to all rows
- Auto-role assignment based on email (contains "vip" or "executive")

### 💰 Pricing

- Base price per event (₹800 - ₹5000)
- Automatic GST calculation (18%)
- Live cart with selected seat summary

### 📱 Mobile-Responsive

- Responsive grid layout
- Sticky cart bar at bottom
- Slide-out booking drawer

## Testing the Application

### Login with Different Roles

1. **VIP User**: Email `vip@example.com`, any password (min 6 chars)
2. **Executive**: Email `executive@example.com`, any password (min 6 chars)
3. **Citizen**: Email `citizen@example.com`, any password (min 6 chars)

### Flow

1. Home page → "Get Started" or "Browse Events"
2. Events page → Click "Book Seats"
3. Book Event page → Select seats from grid
4. Cart bar updates automatically
5. Click "Review & Checkout" to confirm
6. "Generate Digital Ticket" completes booking

## Tech Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| **Framework**     | Next.js 16 (App Router) |
| **Language**      | TypeScript 5.8          |
| **Styling**       | Tailwind CSS 4.2        |
| **Icons**         | Lucide React 0.575      |
| **Notifications** | Sonner 2.0.7            |
| **Build**         | Turbopack               |
| **Runtime**       | Node.js                 |

## Configuration Files

### `next.config.ts`

Next.js configuration with TypeScript support.

### `tailwind.config.ts`

Tailwind CSS v4 with color customization (primary: #4A6B7B, accent: #B86B6B).

### `tsconfig.json`

TypeScript with path aliases (`@/*` → `./src/*`).

### `postcss.config.js`

PostCSS with @tailwindcss/postcss plugin for Tailwind v4.

### `eslint.config.js`

ESLint configuration extending Next.js recommended rules.

## Development Commands

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Data Flow

### Create New Event Data

Edit `src/lib/mockData.ts`:

- Add to `EVENTS` array
- Define corresponding `Venue` in `VENUES` object
- Update `getEventById()` if needed

### Persist Data

Current implementation uses:

- localStorage for auth session
- Mock in-memory data for events

For backend integration:

- Replace `getEventById()` with API call
- Add server actions for bookings
- Implement database persistence

## Performance Optimizations

- ✅ Memoized `Seat` component (prevents re-renders on state changes)
- ✅ Memoized `SeatRow` component with custom comparator
- ✅ useCallback for stable event handlers
- ✅ useMemo for price calculations
- ✅ CSS-in-JS for component styling

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Known Limitations

- Mock data only (not persisted to backend)
- No real payment processing
- No email ticket delivery
- No WebSocket for real-time updates
- No user accounts/history

## Future Enhancements

- [ ] Backend API integration (Express/Node.js)
- [ ] Payment gateway (Stripe/Razorpay)
- [ ] Email with digital tickets (QR codes)
- [ ] WebSocket for real-time seat availability
- [ ] User dashboard with booking history
- [ ] Group bookings & discounts
- [ ] Seat preferences (aisle, window, etc.)
- [ ] Dark mode toggle

## Troubleshooting

### Port 3000 already in use

```bash
npx lsof -i :3000  # Find process
kill -9 <PID>      # Kill it
# or use different port:
npm run dev -- -p 3001
```

### Build fails with TypeScript errors

```bash
npm run build -- --debug
```

### Tailwind styles not loading

Ensure `src/app/globals.css` is imported in `src/app/layout.tsx`.

## Project Architecture Notes

### Next.js App Router

- File-based routing: `app/events/page.tsx` → `/events`
- Dynamic segments: `[id]` creates dynamic route parameters
- Automatic code splitting and optimization

### Client vs Server Components

- `"use client"` directive at top of file for client components
- Auth context is client-only (uses localStorage)
- Page components use client state for interactivity
- Server components can fetch data during build

### State Management

- React Context API for auth
- React Hooks (useState, useCallback, useMemo)
- No Redux/Zustand (keeps it simple)

## License

MIT - Free to use and modify

---

**Migrated from**: TanStack Start + Vite  
**Migrated to**: Next.js 16 with App Router  
**Backup location**: `SeatBookingSystem_TanstackStart_backup/`
