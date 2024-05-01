-- Create the database
CREATE DATABASE IF NOT EXISTS USCCDB;

-- Use the database
USE USCCDB;

DROP TABLE IF EXISTS Users;

DROP TABLE IF EXISTS Posts;

DROP TABLE IF EXISTS Volunteers;

DROP TABLE IF EXISTS Region;

DROP TABLE IF EXISTS Resources;

DROP TABLE IF EXISTS IncidentReports;

DROP TABLE IF EXISTS IncidentType;

CREATE TABLE IF NOT EXISTS
    Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        region VARCHAR(50) NULL,
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
    Resources (
        resource_id INT AUTO_INCREMENT PRIMARY KEY,
        resource_type VARCHAR(50) NOT NULL,
        description TEXT,
        location_lat DECIMAL(10, 6),
        location_lng DECIMAL(10, 6)
    );

CREATE TABLE IF NOT EXISTS
    Volunteers (
        volunteer_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        skills TEXT,
        availability TEXT,
        location_lat DECIMAL(10, 6),
        location_lng DECIMAL(10, 6),
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
    IncidentType (
        incident_type_id INT AUTO_INCREMENT PRIMARY KEY,
        incident_type_name VARCHAR(100) NOT NULL,
        description TEXT
    );