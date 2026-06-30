package service

import (
	"errors"
	"strings"
	"wiki-shopping-app/backend/internal/model"

	"gorm.io/gorm"
)

var ErrProductNameTaken = errors.New("a product with this name already exists in your household")

type ProductService struct {
	db *gorm.DB
}

func NewProductService(db *gorm.DB) *ProductService {
	return &ProductService{db: db}
}

func isUniqueViolation(err error) bool {
	msg := err.Error()
	return strings.Contains(msg, "23505") || strings.Contains(msg, "duplicate key")
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
	if err := s.db.Create(product).Error; err != nil {
		if isUniqueViolation(err) {
			return ErrProductNameTaken
		}
		return err
	}
	return nil
}

func (s *ProductService) Update(id, householdID uint, updates map[string]any) (*model.Product, error) {
	var product model.Product
	if err := s.db.Where("id = ? AND household_id = ?", id, householdID).First(&product).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&product).Updates(updates).Error; err != nil {
		if isUniqueViolation(err) {
			return nil, ErrProductNameTaken
		}
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) Delete(id, householdID uint) error {
	return s.db.Where("household_id = ?", householdID).Delete(&model.Product{}, id).Error
}
