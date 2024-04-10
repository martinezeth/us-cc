-- Insert sample data into the Users table if not exists (with hashed passwords)
INSERT IGNORE
INTO Users
(username, password_hash, role) VALUES
('martinezeth', 'hashed_password1', 'user'),
('francojac', 'hashed_password2', 'admin'),
('randazzonic', 'hashed_password3', 'admin');

-- Insert sample data into the Resources table if not exists
INSERT IGNORE
INTO Resources
(resource_type, description, location_lat, location_lng) VALUES
('shelter', 'Temporary shelter for displaced individuals.', 40.7128, -74.0060),
('medical_aid_station', 'Medical aid station for providing emergency medical care.', 34.0522, -118.2437);

-- Insert sample data into the Volunteers table if not exists
INSERT IGNORE
INTO Volunteers
(user_id, skills, availability, location_lat, location_lng) VALUES
((SELECT user_id
FROM Users
WHERE username = 'martinezeth')
, 'Medical Training', 'Weekdays after 5 PM', 40.7128, -74.0060),
((SELECT user_id
FROM Users
WHERE username = 'francojac')
, 'Heavy Machinery Operation', 'Weekends', 34.0522, -118.2437);
