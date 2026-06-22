package service

import (
	"wiki-shopping-app/backend/internal/model"

	"gorm.io/gorm"
)

type ProductService struct {
	db *gorm.DB
}

func NewProductService(db *gorm.DB) *ProductService {
	return &ProductService{db: db}
}

func (s *ProductService) List(householdID uint) ([]model.Product, error) {
	var products []model.Product
	if err := s.db.Where("household_id = ?", householdID).Preload("Images").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (s *ProductService) GetByID(id, householdID uint) (*model.Product, error) {
	var product model.Product
	if err := s.db.Where("id = ? AND household_id = ?", id, householdID).
		Preload("PriceEntries.Store").Preload("Images").First(&product).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) Create(product *model.Product) error {
	return s.db.Create(product).Error
}

func (s *ProductService) Update(id, householdID uint, updates map[string]any) (*model.Product, error) {
	var product model.Product
	if err := s.db.Where("id = ? AND household_id = ?", id, householdID).First(&product).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&product).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) Delete(id, householdID uint) error {
	return s.db.Where("household_id = ?", householdID).Delete(&model.Product{}, id).Error
}
