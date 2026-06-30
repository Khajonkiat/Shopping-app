package service

import (
	"wiki-shopping-app/backend/internal/model"

	"gorm.io/gorm"
)

type PriceEntryService struct {
	db *gorm.DB
}

func NewPriceEntryService(db *gorm.DB) *PriceEntryService {
	return &PriceEntryService{db: db}
}

func (s *PriceEntryService) ListAll(householdID uint) ([]model.PriceEntry, error) {
	var entries []model.PriceEntry
	err := s.db.Preload("Store").
		Where("household_id = ?", householdID).
		Order("recorded_at DESC").
		Find(&entries).Error
	return entries, err
}

func (s *PriceEntryService) ListByProduct(productID, householdID uint) ([]model.PriceEntry, error) {
	var entries []model.PriceEntry
	err := s.db.Preload("Store").
		Where("product_id = ? AND household_id = ?", productID, householdID).
		Order("recorded_at DESC").
		Find(&entries).Error
	if err != nil {
		return nil, err
	}
	return entries, nil
}

func (s *PriceEntryService) Create(entry *model.PriceEntry) error {
	return s.db.Create(entry).Error
}

func (s *PriceEntryService) Update(id, householdID uint, updates map[string]any) (*model.PriceEntry, error) {
	if err := s.db.Model(&model.PriceEntry{}).
		Where("id = ? AND household_id = ?", id, householdID).
		Updates(updates).Error; err != nil {
		return nil, err
	}
	var entry model.PriceEntry
	if err := s.db.Preload("Store").First(&entry, id).Error; err != nil {
		return nil, err
	}
	return &entry, nil
}

func (s *PriceEntryService) Delete(id, householdID uint) error {
	return s.db.Where("household_id = ?", householdID).Delete(&model.PriceEntry{}, id).Error
}
