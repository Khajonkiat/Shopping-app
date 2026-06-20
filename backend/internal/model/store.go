package model

type Store struct {
	Base
	Name         string       `gorm:"not null;uniqueIndex" json:"name"`
	BaseURL      string       `json:"base_url"`
	PriceEntries []PriceEntry `gorm:"foreignKey:StoreID" json:"price_entries,omitempty"`
	Purchases    []Purchase   `gorm:"foreignKey:StoreID" json:"purchases,omitempty"`
}
