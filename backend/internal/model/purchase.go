package model

import "time"

type Purchase struct {
	Base
	ProductID   uint      `gorm:"not null;index" json:"product_id"`
	StoreID     uint      `gorm:"not null;index" json:"store_id"`
	Price       float64   `gorm:"not null" json:"price"`
	Quantity    float64   `gorm:"default:1" json:"quantity"`
	PurchasedAt time.Time `json:"purchased_at"`
	Notes       string    `json:"notes"`
	Product     Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Store       Store     `gorm:"foreignKey:StoreID" json:"store,omitempty"`
}
