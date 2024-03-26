INSERT IGNORE INTO Users (username, password_hash, role) VALUES
('martinezeth', 'originalpassword', 'user'),
('francojac', 'originalpassword', 'admin'),
('randazzonic', 'originalpassword', 'admin');

-- Insert sample data into the Resources table if not exists
INSERT IGNORE INTO Resources (resource_type, description, location_lat, location_lng) VALUES
('shelter', 'Temporary shelter for displaced individuals.', 40.7128, -74.0060),
('medical_aid_station', 'Medical aid station for providing emergency medical care.', 34.0522, -118.2437);

-- Insert sample data into the Volunteers table if not exists
INSERT IGNORE INTO Volunteers (user_id, skills, availability, location_lat, location_lng) VALUES
(1, 'Medical Training', 'Weekdays after 5 PM', 40.7128, -74.0060),
(2, 'Heavy Machinery Operation', 'Weekends', 34.0522, -118.2437);