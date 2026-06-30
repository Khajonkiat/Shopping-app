package db

import (
	"wiki-shopping-app/backend/config"
	"wiki-shopping-app/backend/internal/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		// FK constraints are enforced in application logic; disabling here avoids
		// the chicken-and-egg problem where a user insert fails because household_id
		// doesn't exist yet (user is created first, then the household).
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		return nil, err
	}

	// Drop any FK and unique-index constraints that would block the schema changes.
	db.Exec("ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_households_members")
	db.Exec("DROP INDEX IF EXISTS uni_stores_name")

	if err := db.AutoMigrate(
		&model.Household{},
		&model.HouseholdInvite{},
		&model.User{},
		&model.Product{},
		&model.Store{},
		&model.PriceEntry{},
		&model.Purchase{},
		&model.ProductImage{},
		&model.PasswordResetToken{},
	); err != nil {
		return nil, err
	}

	return db, nil
}
