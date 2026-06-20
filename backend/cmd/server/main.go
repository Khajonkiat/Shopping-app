package main

import (
	"log"
	"os"
	"wiki-shopping-app/backend/config"
	"wiki-shopping-app/backend/internal/db"
	"wiki-shopping-app/backend/internal/router"
	"wiki-shopping-app/backend/internal/service"
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

	if cfg.MasterEmail != "" && cfg.MasterPassword != "" {
		userSvc := service.NewUserService(database)
		if err := userSvc.EnsureMaster(cfg.MasterEmail, cfg.MasterUsername, cfg.MasterPassword); err != nil {
			log.Fatalf("failed to ensure master account: %v", err)
		}
		log.Printf("master account ready: %s", cfg.MasterEmail)
	} else {
		log.Println("warning: MASTER_EMAIL / MASTER_PASSWORD not set — no master account provisioned")
	}

	r := router.Setup(database, uploadDir, cfg.JWTSecret)

	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
