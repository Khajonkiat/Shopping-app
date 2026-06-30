package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL     string
	DBHost          string
	DBPort          string
	DBUser          string
	DBPassword      string
	DBName          string
	DBSSLMode       string
	ServerPort      string
	JWTSecret       string
	MasterEmail     string
	MasterUsername  string
	MasterPassword  string
	SMTPHost        string
	SMTPPort        string
	SMTPUser        string
	SMTPPass        string
	AppURL          string
}

func (c *Config) DSN() string {
	if c.DatabaseURL != "" {
		return c.DatabaseURL
	}
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}

func Load() *Config {
	_ = godotenv.Load()

	// Railway sets PORT; fall back to SERVER_PORT for local dev.
	port := os.Getenv("PORT")
	if port == "" {
		port = getEnv("SERVER_PORT", "8080")
	}

	return &Config{
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPassword:     getEnv("DB_PASSWORD", "postgres"),
		DBName:         getEnv("DB_NAME", "wiki_shopping"),
		DBSSLMode:      getEnv("DB_SSLMODE", "disable"),
		ServerPort:     port,
		JWTSecret:      getEnv("JWT_SECRET", "change-me-in-production"),
		MasterEmail:    getEnv("MASTER_EMAIL", ""),
		MasterUsername: getEnv("MASTER_USERNAME", "master"),
		MasterPassword: getEnv("MASTER_PASSWORD", ""),
		SMTPHost:       getEnv("SMTP_HOST", ""),
		SMTPPort:       getEnv("SMTP_PORT", "587"),
		SMTPUser:       getEnv("SMTP_USER", ""),
		SMTPPass:       getEnv("SMTP_PASSWORD", ""),
		AppURL:         getEnv("APP_URL", "http://localhost:3000"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
