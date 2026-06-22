package model

type User struct {
	Base
	Email        string `gorm:"uniqueIndex;not null" json:"email"`
	Username     string `gorm:"not null" json:"username"`
	PasswordHash string `gorm:"not null" json:"-"`
	Role         string `gorm:"not null;default:'user'" json:"role"`
	HouseholdID  uint   `gorm:"index" json:"household_id"`
}
