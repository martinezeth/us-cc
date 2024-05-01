-- Insert sample data into the Users table if not exists (with hashed passwords)
INSERT
    IGNORE INTO Users (username, password_hash, role)
VALUES
    ('martinezeth', 'hashed_password1', 'user'),
    ('francojac', 'hashed_password2', 'admin'),
    ('randazzonic', 'hashed_password3', 'admin');

-- Insert sample data into the Region table if not exists
INSERT
    IGNORE INTO Region (region_name, state, city, postal_code)
VALUES
    ('Region 1', 'State 1', 'City 1', 'Postal Code 1'),
    ('Region 2', 'State 2', 'City 2', 'Postal Code 2'),
    ('Region 3', 'State 3', 'City 3', 'Postal Code 3');

-- Insert sample data into the Volunteers table if not exists
-- Insert records into Posts table referencing Users
INSERT
    IGNORE INTO Posts (user_id, title, body, region, date_posted)
VALUES
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'martinezeth'
        ),
        'Title 1',
        'Body 1',
        'Region 1',
        NOW()
    ),
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'francojac'
        ),
        'Title 2',
        'Body 2',
        'Region 2',
        NOW()
    ),
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'randazzonic'
        ),
        'Title 3',
        'Body 3',
        'Region 3',
        NOW()
    );

-- Insert records into IncidentReports table referencing Users
INSERT
    IGNORE INTO IncidentReports (
        user_id,
        incident_type,
        description,
        location_lat,
        location_lng
    )
VALUES
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'martinezeth'
        ),
        'Type 1',
        'Description 1',
        10.123456,
        20.654321
    ),
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'francojac'
        ),
        'Type 2',
        'Description 2',
        30.654321,
        40.123456
    ),
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'randazzonic'
        ),
        'Type 3',
        'Description 3',
        50.123456,
        60.654321
    );

-- Insert records into Volunteers table referencing Users
INSERT
    IGNORE INTO Volunteers (user_id, skills, availability, region)
VALUES
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'martinezeth'
        ),
        'Skill 1',
        'Availability 1',
        'Region 1'
    ),
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'francojac'
        ),
        'Skill 2',
        'Availability 2',
        'Region 2'
    ),
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'randazzonic'
        ),
        'Skill 3',
        'Availability 3',
        'Region 3'
    );

-- Insert volunteering locations
INSERT INTO
    VolunteeringLocation (location_name, region_id)
VALUES
    ('Location 1', 1),
    ('Location 2', 2),
    ('Location 3', 3);

-- Associate users with volunteering locations
INSERT INTO
    UserVolunteeringLocation (user_id, location_id)
VALUES
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'martinezeth'
        ),
        1
    ),
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'francojac'
        ),
        2
    ),
    (
        (
            SELECT
                user_id
            FROM
                Users
            WHERE
                username = 'randazzonic'
        ),
        3
    );