-- Drop in reverse dependency order so foreign keys don't block us
DROP TABLE IF EXISTS booking_seat;
DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS seat;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS venue;
DROP TABLE IF EXISTS app_user;

-- Venue: the physical room inside RIC
CREATE TABLE venue (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    image_url    VARCHAR(255),
    total_capacity INT,
    area         VARCHAR(255),
    venue_type   VARCHAR(255)
);

-- Event: a specific show happening at a venue on a date
CREATE TABLE event (
    id           BIGSERIAL PRIMARY KEY,
    venue_id     BIGINT REFERENCES venue(id),
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    event_type   VARCHAR(255),
    banner_image VARCHAR(255),
    event_date   TIMESTAMP,
    start_time   TIME,
    end_time     TIME,
    status       VARCHAR(50),        -- LIVE | UPCOMING | COMPLETED | CANCELLED
    ticket_price DECIMAL(10, 2),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- App user: authenticated via Phone and Password
CREATE TABLE app_user (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255),
    phone       VARCHAR(15) NOT NULL UNIQUE,  -- login identifier
    password    VARCHAR(255) NOT NULL,        -- hashed password
    nationality VARCHAR(50) DEFAULT 'Indian',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seat: generated per event (not per venue) so each event can have its own layout
CREATE TABLE seat (
    id          BIGSERIAL PRIMARY KEY,
    event_id    BIGINT REFERENCES event(id),
    section     VARCHAR(50),        -- VIP | General
    row_label   VARCHAR(5),         -- A, B, C ... Z, AA
    seat_number INT,
    status      VARCHAR(20) DEFAULT 'AVAILABLE',  -- AVAILABLE | BOOKED
    price       DECIMAL(10, 2)
);

-- Booking: the overall transaction (one booking = one checkout)
CREATE TABLE booking (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES app_user(id),
    event_id     BIGINT REFERENCES event(id),
    booking_ref  VARCHAR(50) UNIQUE,   -- e.g. RIC-20260615-001
    total_seats  INT,
    total_amount DECIMAL(10, 2),
    status       VARCHAR(20) DEFAULT 'CONFIRMED',  -- CONFIRMED | CANCELLED
    booked_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BookingSeat: which specific seats belong to which booking
CREATE TABLE booking_seat (
    id         BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES booking(id),
    seat_id    BIGINT REFERENCES seat(id)
);
