-- ─── Venues ──────────────────────────────────────────────────────────────────
INSERT INTO venue (name, description, image_url, total_capacity, area, venue_type) VALUES
('Auditorium Main',
 'Theatre style with fixed seating of 648 chairs, stage, two green rooms and Prefunction area. For Cultural Programmes, Events, Functions, Conferences, Seminars.',
 'https://member.ricjaipur.org/storage/images/venues/1715154712.JPG',
 648, '850 sq. m.', 'Auditorium'),

('Convention Hall',
 'Fully-carpeted hall having a capacity of 500 persons. Includes 60 banquet round tables and 300 chairs. Also includes Pantry and Buffet area.',
 'https://member.ricjaipur.org/storage/images/venues/1715158066.JPG',
 500, '1300 sq. m.', 'Hall'),

('Auditorium Mini 1',
 'Theatre style with fixed seating of 172 chairs, stage and one green room. For Cultural Programmes, Events, Functions, Conferences, Seminars.',
 'https://member.ricjaipur.org/storage/images/venues/1715157436.JPG',
 172, '275 sq. m.', 'Auditorium');


-- ─── Events ──────────────────────────────────────────────────────────────────
INSERT INTO event (venue_id, title, description, event_type, banner_image, event_date, start_time, end_time, status, ticket_price) VALUES
(1,
 'RIC Annual Cultural Night',
 'A grand night of cultural performances celebrating arts, music, and dance at the Rajasthan International Centre.',
 'Cultural',
 'https://member.ricjaipur.org/images/ric-banner.png',
 '2026-06-15 18:00:00', '18:00:00', '22:00:00', 'LIVE', 500.00),

(2,
 'Startup Pitch Competition',
 'Watch the best startups from Rajasthan pitch their ideas to top investors and industry leaders.',
 'Business',
 'https://member.ricjaipur.org/images/ric-banner.png',
 '2026-06-20 10:00:00', '10:00:00', '16:00:00', 'LIVE', 200.00),

(3,
 'AI & Technology Summit 2026',
 'A one-day deep dive into Artificial Intelligence, Machine Learning, and the future of technology in India.',
 'Technology',
 'https://member.ricjaipur.org/images/ric-banner.png',
 '2026-06-25 09:00:00', '09:00:00', '18:00:00', 'UPCOMING', 300.00);


-- ─── Seats for Event 1: RIC Cultural Night (Auditorium Main, 648 seats) ──────
-- Layout: 27 rows (A–Z + AA), 24 seats per row
-- Rows A–F (seats 1-144): VIP @ ₹750
-- Rows G–Z + AA (seats 145-648): General @ ₹500

-- VIP rows A–F (6 rows × 24 seats = 144 seats)
INSERT INTO seat (event_id, section, row_label, seat_number, status, price)
SELECT
    1,
    'VIP',
    chr(64 + row_num),   -- 65='A', 66='B' ... 70='F'
    seat_num,
    CASE
        -- Pre-mark ~15% as BOOKED to make map look realistic
        WHEN (row_num * 24 + seat_num) % 7 = 0 THEN 'BOOKED'
        ELSE 'AVAILABLE'
    END,
    750.00
FROM generate_series(1, 6) AS row_num,
     generate_series(1, 24) AS seat_num;

-- General rows G–Z (20 rows × 24 seats = 480 seats)
INSERT INTO seat (event_id, section, row_label, seat_number, status, price)
SELECT
    1,
    'General',
    chr(64 + row_num),   -- 71='G' ... 90='Z'
    seat_num,
    CASE
        WHEN (row_num * 24 + seat_num) % 5 = 0 THEN 'BOOKED'
        ELSE 'AVAILABLE'
    END,
    500.00
FROM generate_series(7, 26) AS row_num,   -- G to Z = 20 rows
     generate_series(1, 24) AS seat_num;

-- Row AA (1 row × 24 seats = 24 seats) — label is 'AA'
INSERT INTO seat (event_id, section, row_label, seat_number, status, price)
SELECT
    1,
    'General',
    'AA',
    seat_num,
    'AVAILABLE',
    500.00
FROM generate_series(1, 24) AS seat_num;


-- ─── Seats for Event 2: Startup Pitch (Convention Hall, 500 seats) ───────────
-- Layout: 25 rows (A–Y), 20 seats per row, all General @ ₹200

INSERT INTO seat (event_id, section, row_label, seat_number, status, price)
SELECT
    2,
    'General',
    chr(64 + row_num),
    seat_num,
    CASE
        WHEN (row_num * 20 + seat_num) % 6 = 0 THEN 'BOOKED'
        ELSE 'AVAILABLE'
    END,
    200.00
FROM generate_series(1, 25) AS row_num,
     generate_series(1, 20) AS seat_num;


-- ─── Seats for Event 3: AI Summit (Auditorium Mini 1, 172 seats) ─────────────
-- Layout: 12 rows (A–L), mix of 14 and 15 seats per row ≈ 172 seats
-- Rows A–D (4 rows × 15 = 60): VIP @ ₹450
-- Rows E–L (8 rows × 14 = 112): General @ ₹300

INSERT INTO seat (event_id, section, row_label, seat_number, status, price)
SELECT
    3,
    'VIP',
    chr(64 + row_num),
    seat_num,
    CASE
        WHEN (row_num * 15 + seat_num) % 8 = 0 THEN 'BOOKED'
        ELSE 'AVAILABLE'
    END,
    450.00
FROM generate_series(1, 4) AS row_num,
     generate_series(1, 15) AS seat_num;

INSERT INTO seat (event_id, section, row_label, seat_number, status, price)
SELECT
    3,
    'General',
    chr(64 + row_num),
    seat_num,
    CASE
        WHEN (row_num * 14 + seat_num) % 9 = 0 THEN 'BOOKED'
        ELSE 'AVAILABLE'
    END,
    300.00
FROM generate_series(5, 12) AS row_num,
     generate_series(1, 14) AS seat_num;

