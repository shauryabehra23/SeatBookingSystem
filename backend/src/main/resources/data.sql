INSERT INTO venue (name, description, image_url, total_capacity, area, venue_type) VALUES
('Auditorium Main', 'Theatre style with fixed seating', 'auditorium-main.jpg', 648, '850 sq. m.', 'Auditorium'),
('Convention Hall', 'Fully-carpeted hall', 'convention-hall.jpg', 500, '1300 sq. m.', 'Hall');

INSERT INTO event (venue_id, title, description, event_type, banner_image, event_date, start_time, end_time, status, ticket_price) VALUES
(1, 'RIC Annual Cultural Night', 'A grand night of cultural performances.', 'Cultural', 'cultural-night.jpg', '2026-06-15 18:00:00', '18:00:00', '22:00:00', 'LIVE', 500.00),
(2, 'Startup Pitch Competition', 'Watch the best startups pitch their ideas.', 'Business', 'startup-pitch.jpg', '2026-06-20 10:00:00', '10:00:00', '16:00:00', 'LIVE', 200.00);
