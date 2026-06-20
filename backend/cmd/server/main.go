package main

import (
	"log"
	"os"
	"wiki-shopping-app/backend/config"
	"wiki-shopping-app/backend/internal/db"
	"wiki-shopping-app/backend/internal/router"
)

const uploadDir = "uploads"

func main() {
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Fatalf("failed to create uploads directory: %v", err)
	}

	cfg := config.Load()

	database, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	r := router.Setup(database, uploadDir)

	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
