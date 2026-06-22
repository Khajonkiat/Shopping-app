package model

import "time"

type HouseholdInvite struct {
	Base
	HouseholdID uint       `gorm:"not null;index" json:"household_id"`
	Code        string     `gorm:"not null;uniqueIndex" json:"code"`
	ExpiresAt   time.Time  `json:"expires_at"`
	UsedAt      *time.Time `json:"used_at"`
}
