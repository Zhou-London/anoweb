package repositories

import (
	"fmt"
	"log"

	"anonchihaya.co.uk/src/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDatabase sets up the database connection and auto-migrates models.
func InitDatabase(usr string, pass string, host string, port string, name string) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", usr, pass, host, port, name)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	if err := DB.AutoMigrate(
		&models.User{},
		&models.Session{},
		&models.Profile{},
		&models.Experience{},
		&models.Education{},
		&models.Project{},
		&models.Learning{},
		&models.Post{},
	); err != nil {
		log.Fatal(err)
	}
}
