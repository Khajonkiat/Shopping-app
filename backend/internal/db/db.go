package db

import (
	"wiki-shopping-app/backend/config"
	"wiki-shopping-app/backend/internal/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(
		&model.Product{},
		&model.Store{},
		&model.PriceEntry{},
		&model.Purchase{},
		&model.ProductImage{},
	); err != nil {
		return nil, err
	}

	return db, nil
}
