CREATE DATABASE IF NOT EXISTS anoweb;
USE anoweb;
DROP TABLE IF EXISTS profile_info;
CREATE TABLE profile_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    email VARCHAR(100),
    github VARCHAR(100),
    linkedin VARCHAR(100),
    bio VARCHAR(200)
);