package service

import (
	"errors"
	"wiki-shopping-app/backend/internal/model"

	"gorm.io/gorm"
)

type ProductImageService struct {
	db *gorm.DB
}

func NewProductImageService(db *gorm.DB) *ProductImageService {
	return &ProductImageService{db: db}
}

func (s *ProductImageService) ListByProduct(productID uint) ([]model.ProductImage, error) {
	var images []model.ProductImage
	err := s.db.Where("product_id = ?", productID).Order("created_at ASC").Find(&images).Error
	return images, err
}

func (s *ProductImageService) Create(image *model.ProductImage) error {
	return s.db.Create(image).Error
}

// Delete hard-deletes the record and returns the filename so the caller can remove the file.
func (s *ProductImageService) Delete(id uint) (string, error) {
	var image model.ProductImage
	if err := s.db.First(&image, id).Error; err != nil {
		return "", err
	}
	if err := s.db.Unscoped().Delete(&image).Error; err != nil {
		return "", err
	}
	return image.Filename, nil
}

func (s *ProductImageService) IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
