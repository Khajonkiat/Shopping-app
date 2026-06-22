package model

type Store struct {
	Base
	HouseholdID  uint         `gorm:"not null;index;uniqueIndex:idx_store_household_name" json:"household_id"`
	Name         string       `gorm:"not null;uniqueIndex:idx_store_household_name" json:"name"`
	BaseURL      string       `json:"base_url"`
	PriceEntries []PriceEntry `gorm:"foreignKey:StoreID" json:"price_entries,omitempty"`
	Purchases    []Purchase   `gorm:"foreignKey:StoreID" json:"purchases,omitempty"`
}
