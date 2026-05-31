DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS venue;

CREATE TABLE venue (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    total_capacity INT,
    area VARCHAR(255),
    venue_type VARCHAR(255)
);

CREATE TABLE event (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT REFERENCES venue(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(255),
    banner_image VARCHAR(255),
    event_date TIMESTAMP,
    start_time TIME,
    end_time TIME,
    status VARCHAR(50),
    ticket_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
