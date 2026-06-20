package model

type ProductImage struct {
	Base
	ProductID uint   `gorm:"not null;index" json:"product_id"`
	Filename  string `gorm:"not null" json:"filename"`
}
