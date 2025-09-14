CREATE DATABASE IF NOT EXISTS anoweb;
USE anoweb;
CREATE TABLE IF NOT EXISTS profile_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    email VARCHAR(100),
    github VARCHAR(100),
    linkedin VARCHAR(100),
    bio VARCHAR(200)
);
CREATE TABLE IF NOT EXISTS experiences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company VARCHAR(100),
    position VARCHAR(100),
    start_date DATE,
    end_date DATE,
    present BOOLEAN,
    description TEXT,
    image_url VARCHAR(200)
);
CREATE TABLE IF NOT EXISTS educations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school VARCHAR(100),
    degree VARCHAR(100),
    start_date DATE,
    end_date DATE,
    link VARCHAR(200),
    image_url VARCHAR(200)
);