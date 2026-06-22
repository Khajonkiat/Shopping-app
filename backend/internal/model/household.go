package model

type Household struct {
	Base
	Name    string `gorm:"not null" json:"name"`
	AdminID uint   `gorm:"not null" json:"admin_id"`
	Members []User `gorm:"foreignKey:HouseholdID" json:"members,omitempty"`
}
