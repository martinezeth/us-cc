-- Insert 30 sample records into the Users table with randomized usernames and generic password hash
INSERT IGNORE
INTO Users
(username, password_hash, role)
SELECT CONCAT('user', SUBSTRING(MD5(RAND()) FROM 1
FOR 8)), 'hashed_password', 'user'
FROM
(
    SELECT 1
UNION
    SELECT 2
UNION
    SELECT 3
UNION
    SELECT 4
UNION
    SELECT 5)
AS numbers
LIMIT 30;

-- Insert 30 sample records into the Posts table with randomized titles and bodies
INSERT IGNORE
INTO Posts
(user_id, title, body)
SELECT
    user_id,
    CONCAT('Title ', FLOOR(1 + RAND() * 5)),
    CONCAT('Body of the post ', FLOOR(1 + RAND() * 5))
FROM Users
LIMIT
30;

-- Insert 30 sample records into the IncidentReports table with randomized data
INSERT IGNORE
INTO IncidentReports
(user_id, incident_type, description, location_lat, location_lng)
SELECT
    user_id,
    CASE
        WHEN RAND() < 0.5 THEN 'Type A'
        ELSE 'Type B'
    END AS incident_type,
    CONCAT('Description of ', CASE
                                WHEN RAND() < 0.5 THEN 'Type A'
                                ELSE 'Type B'
                             END),
    (RAND() * (90 + 90) - 90) AS location_lat,
    (RAND() * (180 + 180) - 180) AS location_lng
FROM Users
LIMIT
30;

-- Insert 30 sample records into the Resources table with randomized data
INSERT IGNORE
INTO Resources
(resource_type, description, location_lat, location_lng)
SELECT
    CASE
        WHEN RAND() < 0.5 THEN 'shelter'
        ELSE 'medical_aid_station'
    END AS resource_type,
    CONCAT('Description of ', CASE
                                WHEN RAND() < 0.5 THEN 'shelter'
                                ELSE 'medical aid station'
                             END) AS description,
    (RAND() * (90 + 90) - 90) AS location_lat,
    (RAND() * (180 + 180) - 180) AS location_lng
FROM (                    SELECT 1
    UNION
        SELECT 2
    UNION
        SELECT 3
    UNION
        SELECT 4
    UNION
        SELECT 5) AS numbers
LIMIT 30;

-- Insert 30 sample records into the Volunteers table with randomized data
INSERT IGNORE
INTO Volunteers
(user_id, skills, availability, location_lat, location_lng)
SELECT
    user_id,
    CONCAT('Skill ', FLOOR(1 + RAND() * 5), ', Skill ', FLOOR(1 + RAND() * 5)) AS skills,
    CONCAT('Availability on ', CASE
                                    WHEN RAND() < 0.5 THEN 'Weekdays'
                                    ELSE 'Weekends'
                                 END, ' ', CASE
                                            WHEN RAND() < 0.5 THEN 'morning'
                                            ELSE 'evening'
                                          END) AS availability,
    (RAND() * (90 + 90) - 90) AS location_lat,
    (RAND() * (180 + 180) - 180) AS location_lng
FROM Users
LIMIT
30;

-- Insert 30 sample records into the Region table with randomized data
INSERT IGNORE
INTO Region
(region_name, country, state, city, postal_code)
SELECT
    CONCAT('Region ', FLOOR(1 + RAND() * 5)),
    'Country',
    CONCAT('State ', FLOOR(1 + RAND() * 5)),
    CONCAT('City ', FLOOR(1 + RAND() * 5)),
    CONCAT('Postal Code ', FLOOR(10000 + RAND() * 90000))
FROM (                    SELECT 1
    UNION
        SELECT 2
    UNION
        SELECT 3
    UNION
        SELECT 4
    UNION
        SELECT 5) AS numbers
LIMIT 30;

-- Insert 30 sample records into the IncidentType table with randomized data
INSERT IGNORE
INTO IncidentType
(incident_type_name, description)
SELECT
    CONCAT('Type ', FLOOR(1 + RAND() * 5)),
    CONCAT('Description of Type ', FLOOR(1 + RAND() * 5))
FROM (                    SELECT 1
    UNION
        SELECT 2
    UNION
        SELECT 3
    UNION
        SELECT 4
    UNION
        SELECT 5) AS numbers
LIMIT 30;
