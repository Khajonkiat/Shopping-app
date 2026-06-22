package model

type Product struct {
	Base
	HouseholdID  uint           `gorm:"not null;index" json:"household_id"`
	Name         string         `gorm:"not null;index" json:"name"`
	Category     string         `json:"category"`
	Unit         string         `json:"unit"`
	Description  string         `json:"description"`
	PriceEntries []PriceEntry   `gorm:"foreignKey:ProductID" json:"price_entries,omitempty"`
	Purchases    []Purchase     `gorm:"foreignKey:ProductID" json:"purchases,omitempty"`
	Images       []ProductImage `gorm:"foreignKey:ProductID" json:"images,omitempty"`
}
