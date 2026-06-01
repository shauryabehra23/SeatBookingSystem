# SeatBookingSystem — Backend API Documentation

> **For the frontend developer:** This document tells you everything you need to know to connect the Next.js frontend to the Spring Boot backend. Read the [Quick Start](#quick-start) section first to get the server running.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Quick Start — Running the Backend Locally](#quick-start)
3. [Base URL & CORS](#base-url--cors)
4. [Authentication — How JWT Works](#authentication--how-jwt-works)
5. [API Reference](#api-reference)
   - [Auth Endpoints](#auth-endpoints)
   - [Event Endpoints](#event-endpoints)
   - [Seat Endpoints](#seat-endpoints)
   - [Booking Endpoints](#booking-endpoints)
6. [WebSocket — Real-Time Seat Updates](#websocket--real-time-seat-updates)
7. [Error Responses](#error-responses)
8. [Testing Guide](#testing-guide)
9. [Database Seed Data](#database-seed-data)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3 |
| Database | PostgreSQL (port **5433**) |
| Cache / Locks | Redis (port **6379**) |
| Real-time | WebSocket via STOMP |
| Auth | JWT (24-hour expiry) |
| Build Tool | Maven |

---

## Quick Start

### Prerequisites

1. **Java 17+** — [Download here](https://adoptium.net/)
2. **Docker Desktop** — [Download here](https://www.docker.com/products/docker-desktop/) (Required to run the database & cache easily)

### Step 1 — Start the Database and Redis (The Easy Way)

Since there is a `docker-compose.yml` file included in the backend, you do NOT need to install PostgreSQL or Redis manually on your computer! Just open a terminal in the `backend` folder and run:

```bash
docker compose up -d
```
*(This instantly starts PostgreSQL on port 5433, Redis on port 6379, and creates the `seatbooking` database for you!)*

### Step 2 — Run the Spring Boot Application

**Environment Variables Note:** 
You do **not** need to create a `.env` file for local development. The `application.properties` file is already configured with smart defaults (e.g., `${DB_URL:jdbc:postgresql://localhost:5433/seatbooking}`) that perfectly match the `docker-compose.yml` setup. It will work out of the box!

```bash
cd backend
./mvnw spring-boot:run        # On Mac/Linux
mvnw.cmd spring-boot:run      # On Windows
```

Or simply open the project in IntelliJ IDEA and click the **Run** button on `BackendApplication.java`.

### Step 4 — Verify it's running

Open this in your browser:
```
http://localhost:8080/api/events
```

You should see a JSON array of 3 events. If you do, the backend is fully running! ✅

> **Note:** On first startup, Spring Boot automatically runs `schema.sql` (creates all tables) and `data.sql` (seeds 3 venues, 3 events, and 1320 seats). This happens every time you restart, wiping and re-seeding all data. This is fine for demo purposes.

---

## Base URL & CORS

```
http://localhost:8080
```

CORS is pre-configured to allow requests from:
- `http://localhost:3000` (Next.js default)
- `http://localhost:5173` (Vite default)

You do **not** need to configure any proxy. You can call the API directly from your frontend `fetch()` calls.

---

## Authentication — How JWT Works

Most endpoints require authentication. Here's the flow:

```
1. User calls POST /api/auth/login  →  gets back a { token: "eyJ..." }
2. Frontend stores the token in localStorage or a React context
3. Every protected request includes the header:
      Authorization: Bearer eyJ...
4. The backend validates the token automatically. No session, no cookies.
```

### Token Details
- **Format:** `Bearer <token>` in the `Authorization` header
- **Expiry:** 24 hours
- **Algorithm:** HMAC-SHA256

---

## API Reference

---

### Auth Endpoints

#### `POST /api/auth/register`

Registers a new user account. Returns a JWT token immediately.

**Auth Required:** No

**Request Body:**
```json
{
  "name": "Alakh Sharma",
  "phone": "9876543210",
  "nationality": "Indian",
  "password": "password123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `name` | string | Yes | Cannot be blank |
| `phone` | string | Yes | 10–15 digits, must be unique |
| `nationality` | string | No | Optional, defaults to "Indian" |
| `password` | string | Yes | Minimum 6 characters |

**Success Response — `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Alakh Sharma",
    "phone": "9876543210",
    "nationality": "Indian",
    "createdAt": "2026-06-01T10:00:00"
  }
}
```

**Error Responses:**
- `400 Bad Request` — Validation failed (e.g., password too short)
- `409 Conflict` — Phone number already registered

---

#### `POST /api/auth/login`

Logs in an existing user and returns a fresh JWT token.

**Auth Required:** No

**Request Body:**
```json
{
  "phone": "9876543210",
  "password": "password123"
}
```

**Success Response — `200 OK`:** Same shape as `/register` above.

**Error Responses:**
- `401 Unauthorized` — Wrong password
- `404 Not Found` — Phone number not registered

---

### Event Endpoints

#### `GET /api/events`

Returns all events. Used for the events listing page.

**Auth Required:** No

**Success Response — `200 OK`:**
```json
[
  {
    "id": 1,
    "title": "RIC Annual Cultural Night",
    "description": "A grand night of cultural performances...",
    "eventType": "Cultural",
    "bannerImage": "https://member.ricjaipur.org/images/ric-banner.png",
    "eventDate": "2026-06-15T18:00:00",
    "startTime": "18:00:00",
    "endTime": "22:00:00",
    "status": "LIVE",
    "ticketPrice": 500.00,
    "venue": {
      "id": 1,
      "name": "Auditorium Main",
      "totalCapacity": 648,
      "area": "850 sq. m.",
      "venueType": "Auditorium"
    }
  }
]
```

---

### Seat Endpoints

#### `GET /api/events/{eventId}/seats`

Returns all seats for a specific event with their **live** statuses.

**Auth Required:** No

**URL Parameters:**
- `eventId` — The ID of the event (1, 2, or 3 in seed data)

Each seat has one of three statuses:

| Status | Meaning | Suggested UI Color |
|--------|---------|------------|
| `AVAILABLE` | Free to select | Green |
| `HELD` | Temporarily held by another user (5 min) | Yellow/Orange |
| `BOOKED` | Permanently taken | Dark Grey |

**Success Response — `200 OK`:**
```json
[
  {
    "id": 1,
    "eventId": 1,
    "section": "VIP",
    "rowLabel": "A",
    "seatNumber": 1,
    "status": "AVAILABLE",
    "price": 750.00
  },
  {
    "id": 7,
    "eventId": 1,
    "section": "VIP",
    "rowLabel": "A",
    "seatNumber": 7,
    "status": "HELD",
    "price": 750.00
  }
]
```

> **Frontend Note:** The `HELD` status is computed dynamically from Redis on every request. You do NOT need to poll this endpoint repeatedly — use WebSocket instead to receive instant updates.

---

#### `POST /api/events/{eventId}/seats/hold`

Temporarily holds seats for 5 minutes for the logged-in user. Call this when the user selects seats and proceeds to checkout.

**Auth Required:** Yes

**Request Body:**
```json
{
  "eventId": 1,
  "seatIds": [101, 102]
}
```

**Success Response — `200 OK`:**
```json
{
  "message": "Seats held successfully. You have 5 minutes to complete your booking."
}
```

**Error Responses:**
- `401 Unauthorized` — No/invalid JWT token
- `404 Not Found` — Seat ID doesn't exist
- `400 Bad Request` — Seat doesn't belong to this event
- `409 Conflict` — Seat already booked or held by another user

> **WebSocket Side Effect:** Broadcasts `{ "eventId": 1, "seatIds": [101, 102], "status": "HELD" }` to all users viewing this event's seat map instantly.

---

#### `POST /api/events/{eventId}/seats/release`

Releases seats held by the logged-in user. Call this when the user clicks "Back" from the checkout page.

**Auth Required:** Yes

**Request Body:**
```json
{
  "eventId": 1,
  "seatIds": [101, 102]
}
```

**Success Response — `200 OK`:**
```json
{
  "message": "Seats released successfully."
}
```

> **WebSocket Side Effect:** Broadcasts `{ "seatIds": [...], "status": "AVAILABLE" }` to all connected users.

---

### Booking Endpoints

#### `POST /api/bookings/checkout`

Permanently books the held seats. Call this when the user confirms their booking.

**Auth Required:** Yes

> **Critical:** Seats MUST be held first via `/seats/hold`. If the hold expired or was never made, this returns `409 Conflict`.

**Request Body:**
```json
{
  "eventId": 1,
  "seatIds": [101, 102]
}
```

**Success Response — `200 OK`:**
```json
{
  "bookingRef": "RIC-20260601-4821",
  "eventId": 1,
  "totalSeats": 2,
  "totalAmount": 1500.00,
  "status": "CONFIRMED",
  "bookedAt": "2026-06-01T15:45:34",
  "seats": [
    {
      "seatId": 101,
      "section": "VIP",
      "rowLabel": "E",
      "seatNumber": 5,
      "price": 750.00
    },
    {
      "seatId": 102,
      "section": "VIP",
      "rowLabel": "E",
      "seatNumber": 6,
      "price": 750.00
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` — No/invalid JWT token
- `409 Conflict` — Seats not held by this user (hold expired or never placed)

> **WebSocket Side Effect:** Broadcasts `{ "seatIds": [...], "status": "BOOKED" }` to all connected users.

---

#### `GET /api/bookings/my-bookings`

Returns all bookings made by the currently logged-in user, newest first.

**Auth Required:** Yes

**Success Response — `200 OK`:**

Array of BookingResponse objects (same shape as checkout response above). Returns `[]` if no bookings exist.

---

## WebSocket — Real-Time Seat Updates

### Install Dependencies

```bash
npm install sockjs-client @stomp/stompjs
npm install --save-dev @types/sockjs-client
```

### React Integration Example

```typescript
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

type SeatStatuses = Record<number, string>; // seatId → "AVAILABLE" | "HELD" | "BOOKED"

export function useSeatMapWebSocket(eventId: number) {
  const [seatStatuses, setSeatStatuses] = useState<SeatStatuses>({});

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-tickets'),
    });

    client.onConnect = () => {
      client.subscribe(`/topic/events/${eventId}/seats`, (message) => {
        const update = JSON.parse(message.body);
        // update = { eventId: 1, seatIds: [101, 102], status: "HELD" }

        setSeatStatuses(prev => {
          const next = { ...prev };
          update.seatIds.forEach((id: number) => {
            next[id] = update.status;
          });
          return next;
        });
      });
    };

    client.activate();
    return () => { client.deactivate(); };
  }, [eventId]);

  return seatStatuses;
}
```

### WebSocket Message Reference

| When | Channel | Payload |
|------|---------|---------|
| User holds seats | `/topic/events/{id}/seats` | `{ "eventId": 1, "seatIds": [101, 102], "status": "HELD" }` |
| User releases seats | `/topic/events/{id}/seats` | `{ "eventId": 1, "seatIds": [101, 102], "status": "AVAILABLE" }` |
| User completes booking | `/topic/events/{id}/seats` | `{ "eventId": 1, "seatIds": [101, 102], "status": "BOOKED" }` |

---

## Error Responses

All errors follow this standardized format:

```json
{
  "timestamp": "2026-06-01T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Some seats were just taken by another user: [101]"
}
```

### HTTP Status Code Reference

| Code | Meaning |
|------|---------|
| `200 OK` | Success |
| `400 Bad Request` | Invalid data (e.g., seat belongs to wrong event) |
| `401 Unauthorized` | JWT missing, expired, or invalid |
| `404 Not Found` | Seat or resource doesn't exist |
| `409 Conflict` | Business rule violation (seat taken, duplicate phone, etc.) |
| `500 Internal Server Error` | Unexpected server error |

---

## Testing Guide

### Full API Test Script (PowerShell — Windows)

Paste this into a PowerShell window with the backend running:

```powershell
Write-Host "`n=== SEAT BOOKING SYSTEM — API TEST ===" -ForegroundColor Magenta

# 1. Register a new user (random phone to avoid conflicts)
Write-Host "`n[1] Registering a new user..." -ForegroundColor Yellow
$phone = "98" + (Get-Random -Minimum 10000000 -Maximum 99999999)
$regBody = "{`"name`":`"Test User`",`"phone`":`"$phone`",`"nationality`":`"Indian`",`"password`":`"password123`"}"
$authResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $regBody
$token = $authResponse.token
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "✅ Registered as phone: $phone" -ForegroundColor Green

# 2. Get all events
Write-Host "`n[2] Fetching all events..." -ForegroundColor Yellow
$events = Invoke-RestMethod -Uri "http://localhost:8080/api/events" -Method Get
Write-Host "✅ Found $($events.Length) events" -ForegroundColor Green
$events | Format-Table -Property id, title, status, ticketPrice

# 3. Get seats for Event 1 and pick 2 available ones
Write-Host "`n[3] Fetching seats for Event 1..." -ForegroundColor Yellow
$seats = Invoke-RestMethod -Uri "http://localhost:8080/api/events/1/seats" -Method Get
$testSeats = ($seats | Where-Object { $_.status -eq "AVAILABLE" } | Select-Object -First 2).id
Write-Host "✅ $($seats.Length) total seats. Using IDs: $($testSeats -join ', ') for test." -ForegroundColor Green

# 4. Hold the seats
Write-Host "`n[4] Holding seats..." -ForegroundColor Yellow
$holdBody = "{`"eventId`": 1, `"seatIds`": [$($testSeats -join ',')]}"
$holdResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/events/1/seats/hold" -Method Post -Headers $headers -ContentType "application/json" -Body $holdBody
Write-Host "✅ $($holdResponse.message)" -ForegroundColor Green

# 5. Checkout
Write-Host "`n[5] Confirming booking..." -ForegroundColor Yellow
$checkoutBody = "{`"eventId`": 1, `"seatIds`": [$($testSeats -join ',')]}"
$booking = Invoke-RestMethod -Uri "http://localhost:8080/api/bookings/checkout" -Method Post -Headers $headers -ContentType "application/json" -Body $checkoutBody
Write-Host "✅ Booking confirmed!" -ForegroundColor Green
Write-Host "   Ref: $($booking.bookingRef) | Amount: Rs.$($booking.totalAmount) | Status: $($booking.status)" -ForegroundColor Cyan

# 6. My Bookings
Write-Host "`n[6] Fetching booking history..." -ForegroundColor Yellow
$myBookings = Invoke-RestMethod -Uri "http://localhost:8080/api/bookings/my-bookings" -Method Get -Headers $headers
Write-Host "✅ Found $($myBookings.Length) booking(s)" -ForegroundColor Green
$myBookings | Format-Table -Property bookingRef, eventId, totalSeats, totalAmount, status

Write-Host "`n=== ALL TESTS PASSED ===" -ForegroundColor Magenta
```

### Test WebSocket Live in Browser

1. Start the backend
2. Open **two** browser tabs at: `http://localhost:8080/ws-test.html`
3. Login and Connect in **both** tabs
4. Hold a seat in **Tab 1** — watch **Tab 2** receive the live update instantly!

---

## Database Seed Data

### Events

| ID | Title | Venue | Capacity | Status | Price |
|----|-------|-------|----------|--------|-------|
| 1 | RIC Annual Cultural Night | Auditorium Main | 648 seats | LIVE | ₹500 |
| 2 | Startup Pitch Competition | Convention Hall | 500 seats | LIVE | ₹200 |
| 3 | AI & Technology Summit 2026 | Auditorium Mini 1 | 172 seats | UPCOMING | ₹300 |

### Seat Layout for Event 1

| Section | Rows | Seats Per Row | Price Per Seat |
|---------|------|---------------|---------------|
| VIP | A–F (6 rows) | 24 | ₹750 |
| General | G–Z + AA (21 rows) | 24 | ₹500 |

> ~15% of seats are pre-marked as `BOOKED` in seed data to make the map look realistic.
