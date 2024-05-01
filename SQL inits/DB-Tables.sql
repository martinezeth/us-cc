-- Create the database
CREATE DATABASE IF NOT EXISTS USCCDB;

-- Use the database
USE USCCDB;


DROP TABLE IF EXISTS Posts;

DROP TABLE IF EXISTS UserVolunteeringLocation;

DROP TABLE IF EXISTS Volunteers;

DROP TABLE IF EXISTS VolunteeringLocation;

DROP TABLE IF EXISTS IncidentReports;

DROP TABLE IF EXISTS Resources;

DROP TABLE IF EXISTS IncidentType;

DROP TABLE IF EXISTS Users;

DROP TABLE IF EXISTS Region;

CREATE TABLE IF NOT EXISTS
    Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL DEFAULT '',
        region INT NULL DEFAULT 1,
        date_joined DATE NULL,
        role ENUM('user', 'admin') DEFAULT 'user'
    );

CREATE TABLE IF NOT EXISTS
    Posts (
        post_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        region VARCHAR(50) NULL,
        date_posted DATETIME NULL,
        FOREIGN KEY (user_id) REFERENCES Users (user_id)
    );

CREATE TABLE IF NOT EXISTS
    Region (
        region_id INT AUTO_INCREMENT PRIMARY KEY,
        region_name VARCHAR(100) NOT NULL,
        state VARCHAR(100) NULL,
        city VARCHAR(100) NULL,
        postal_code VARCHAR(20) NULL,
        UNIQUE (region_name, state, city, postal_code)
    );

CREATE TABLE IF NOT EXISTS
    Volunteers (
        volunteer_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        skills TEXT,
        availability TEXT,
        region VARCHAR(50) NULL,
        FOREIGN KEY (user_id) REFERENCES Users (user_id),
        FOREIGN KEY (region) REFERENCES Region (region_name)
    );

CREATE TABLE IF NOT EXISTS 
    VolunteeringLocation (
        location_id INT AUTO_INCREMENT PRIMARY KEY,
        location_name VARCHAR(50) NOT NULL,
        region_id INT NULL,
        FOREIGN KEY (region_id) REFERENCES Region (region_id)
    );

CREATE TABLE IF NOT EXISTS 
    UserVolunteeringLocation (
        user_id INT,
        location_id INT,
        PRIMARY KEY (user_id, location_id),
        FOREIGN KEY (user_id) REFERENCES Users (user_id),
        FOREIGN KEY (location_id) REFERENCES VolunteeringLocation (location_id)
    );


CREATE TABLE IF NOT EXISTS
    IncidentReports (
        incident_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        incident_type VARCHAR(50) NOT NULL,
        description TEXT,
        location_lat DECIMAL(10, 6),
        location_lng DECIMAL(10, 6),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('reported', 'confirmed') DEFAULT 'reported',
        FOREIGN KEY (user_id) REFERENCES Users (user_id)
    );

CREATE TABLE IF NOT EXISTS
    IncidentType (
        incident_type_id INT AUTO_INCREMENT PRIMARY KEY,
        incident_type_name VARCHAR(100) NOT NULL,
        description TEXT
    );

CREATE TABLE IF NOT EXISTS
    Resources (
        resource_id INT AUTO_INCREMENT PRIMARY KEY,
        resource_type VARCHAR(50) NOT NULL,
        description TEXT,
        location_lat DECIMAL(10, 6),
        location_lng DECIMAL(10, 6)
    );
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `GetUserInfo`(IN `userid` INT) 
BEGIN
SELECT
    U.date_joined,
    U.name,
    U.username,
    U.role,
    VL.location_name 'Volunteering at',
    R.state,
    R.city
FROM
    users U
    JOIN uservolunteeringlocation UVL ON UVL.user_id = U.user_id
    JOIN volunteeringlocation VL ON VL.location_id = UVL.location_id
    JOIN region R ON U.region = R.region_id
WHERE
    U.user_id = userid;

END$$

CREATE PROCEDURE IF NOT EXISTS `GetUserInfoUsername`(IN `username` VARCHAR(50))
BEGIN
SELECT
    U.date_joined,
    U.name,
    U.username,
    U.role,
    GROUP_CONCAT(VL.location_name SEPARATOR ', ') AS 'Volunteering at',
    -- Concatenate location names
    R.state,
    R.city
FROM
    Users U
    JOIN UserVolunteeringLocation UVL ON UVL.user_id = U.user_id
    JOIN VolunteeringLocation VL ON VL.location_id = UVL.location_id
    JOIN Region R ON U.region = R.region_id
WHERE
    U.username = username
GROUP BY
    U.user_id;

END$$

CREATE PROCEDURE IF NOT EXISTS `GetUserVolunteering`(IN `username` VARCHAR(50))
BEGIN
SELECT
    VL.location_name
FROM
    Users U
    JOIN UserVolunteeringLocation UVL ON U.user_id = UVL.user_id
    JOIN VolunteeringLocation VL ON UVL.location_id = VL.location_id
WHERE
    U.username = username;

END$$

CREATE PROCEDURE IF NOT EXISTS `GetVolunteersByRegion`(IN `regionName` VARCHAR(255))
BEGIN
SELECT
    *
FROM
    Volunteers
WHERE
    region = regionName;

END$$

CREATE PROCEDURE IF NOT EXISTS `GetVolunteersBySkills`(IN `skill` VARCHAR(255))
BEGIN
SELECT
    *
FROM
    Volunteers
WHERE
    FIND_IN_SET(skill, skills) > 0;

END$$
DELIMITER ;