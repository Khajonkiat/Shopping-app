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

func (s *ProductService) List() ([]model.Product, error) {
	var products []model.Product
	if err := s.db.Preload("Images").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (s *ProductService) GetByID(id uint) (*model.Product, error) {
	var product model.Product
	if err := s.db.Preload("PriceEntries.Store").Preload("Images").First(&product, id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) Create(product *model.Product) error {
	return s.db.Create(product).Error
}

func (s *ProductService) Update(id uint, updates map[string]any) (*model.Product, error) {
	var product model.Product
	if err := s.db.First(&product, id).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&product).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) Delete(id uint) error {
	return s.db.Delete(&model.Product{}, id).Error
}
