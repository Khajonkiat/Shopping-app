package model

import "time"

type PasswordResetToken struct {
	Base
	UserID    uint       `gorm:"not null;index" json:"user_id"`
	Token     string     `gorm:"not null;uniqueIndex" json:"token"`
	ExpiresAt time.Time  `json:"expires_at"`
	UsedAt    *time.Time `json:"used_at"`
}
