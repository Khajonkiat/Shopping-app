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

func (s *PurchaseService) List(householdID uint) ([]model.Purchase, error) {
	var purchases []model.Purchase
	err := s.db.Preload("Product").Preload("Store").
		Where("household_id = ?", householdID).
		Order("purchased_at DESC").
		Find(&purchases).Error
	if err != nil {
		return nil, err
	}
	return purchases, nil
}

func (s *PurchaseService) ListByProduct(productID, householdID uint) ([]model.Purchase, error) {
	var purchases []model.Purchase
	err := s.db.Preload("Store").
		Where("product_id = ? AND household_id = ?", productID, householdID).
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

func (s *PurchaseService) Update(id, householdID uint, updates map[string]any) (*model.Purchase, error) {
	if err := s.db.Model(&model.Purchase{}).
		Where("id = ? AND household_id = ?", id, householdID).
		Updates(updates).Error; err != nil {
		return nil, err
	}
	var purchase model.Purchase
	if err := s.db.Preload("Product").Preload("Store").First(&purchase, id).Error; err != nil {
		return nil, err
	}
	return &purchase, nil
}

func (s *PurchaseService) Delete(id, householdID uint) error {
	return s.db.Where("household_id = ?", householdID).Delete(&model.Purchase{}, id).Error
}
