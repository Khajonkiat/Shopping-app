package service

import (
	"wiki-shopping-app/backend/internal/model"

	"gorm.io/gorm"
)

type PurchaseService struct {
	db *gorm.DB
}

func NewPurchaseService(db *gorm.DB) *PurchaseService {
	return &PurchaseService{db: db}
}

func (s *PurchaseService) List() ([]model.Purchase, error) {
	var purchases []model.Purchase
	err := s.db.Preload("Product").Preload("Store").
		Order("purchased_at DESC").
		Find(&purchases).Error
	if err != nil {
		return nil, err
	}
	return purchases, nil
}

func (s *PurchaseService) ListByProduct(productID uint) ([]model.Purchase, error) {
	var purchases []model.Purchase
	err := s.db.Preload("Store").
		Where("product_id = ?", productID).
		Order("purchased_at DESC").
		Find(&purchases).Error
	if err != nil {
		return nil, err
	}
	return purchases, nil
}

func (s *PurchaseService) Create(purchase *model.Purchase) error {
	return s.db.Create(purchase).Error
}

func (s *PurchaseService) Update(id uint, updates map[string]any) (*model.Purchase, error) {
	if err := s.db.Model(&model.Purchase{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return nil, err
	}
	var purchase model.Purchase
	if err := s.db.Preload("Product").Preload("Store").First(&purchase, id).Error; err != nil {
		return nil, err
	}
	return &purchase, nil
}

func (s *PurchaseService) Delete(id uint) error {
	return s.db.Delete(&model.Purchase{}, id).Error
}
