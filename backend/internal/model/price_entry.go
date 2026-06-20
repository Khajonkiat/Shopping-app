package model

import "time"

type SourceType string

const (
	SourceTypeManual  SourceType = "manual"
	SourceTypeScraped SourceType = "scraped"
)

type PriceEntry struct {
	Base
	ProductID  uint       `gorm:"not null;index" json:"product_id"`
	StoreID    uint       `gorm:"not null;index" json:"store_id"`
	Price      float64    `gorm:"not null" json:"price"`
	Currency   string     `gorm:"default:'THB'" json:"currency"`
	RecordedAt time.Time  `json:"recorded_at"`
	SourceType SourceType `gorm:"type:varchar(20);default:'manual'" json:"source_type"`
	SourceURL  string     `json:"source_url"`
	Product    Product    `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Store      Store      `gorm:"foreignKey:StoreID" json:"store,omitempty"`
}
