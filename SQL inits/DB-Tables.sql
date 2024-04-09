-- Create the database
CREATE DATABASE IF NOT EXISTS USCCDB;

-- Use the database
USE USCCDB;

DROP TABLE IncidentReports IF EXISTS;
DROP TABLE Resources IF EXISTS;
DROP TABLE Volunteers IF EXISTS;
DROP TABLE Posts IF EXISTS;
DROP TABLE Users IF EXISTS;


-- Create the Users table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS Posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(max) NOT NULL,
    body VARCHAR(max) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
-- Create the IncidentReports table
CREATE TABLE IF NOT EXISTS IncidentReports (
    incident_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    incident_type VARCHAR(50) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 6),
    location_lng DECIMAL(10, 6),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('reported', 'confirmed') DEFAULT 'reported',
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Create the Resources table
CREATE TABLE IF NOT EXISTS Resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    resource_type VARCHAR(50) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 6),
    location_lng DECIMAL(10, 6)
);

-- Create the Volunteers table
CREATE TABLE IF NOT EXISTS Volunteers (
    volunteer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    skills TEXT,
    availability TEXT,
    location_lat DECIMAL(10, 6),
    location_lng DECIMAL(10, 6),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS IncidentType (
    incidentType_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_type VARCHAR(50) NOT NULL,
    description TEXT

);