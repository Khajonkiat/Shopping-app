package service

import (
	"wiki-shopping-app/backend/internal/model"

	"gorm.io/gorm"
)

type StoreService struct {
	db *gorm.DB
}

func NewStoreService(db *gorm.DB) *StoreService {
	return &StoreService{db: db}
}

func (s *StoreService) List(householdID uint) ([]model.Store, error) {
	var stores []model.Store
	if err := s.db.Where("household_id = ?", householdID).Find(&stores).Error; err != nil {
		return nil, err
	}
	return stores, nil
}

func (s *StoreService) GetByID(id, householdID uint) (*model.Store, error) {
	var store model.Store
	if err := s.db.Where("id = ? AND household_id = ?", id, householdID).First(&store).Error; err != nil {
		return nil, err
	}
	return &store, nil
}

func (s *StoreService) Create(store *model.Store) error {
	return s.db.Create(store).Error
}

func (s *StoreService) Update(id, householdID uint, updates map[string]any) (*model.Store, error) {
	var store model.Store
	if err := s.db.Where("id = ? AND household_id = ?", id, householdID).First(&store).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&store).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &store, nil
}

func (s *StoreService) Delete(id, householdID uint) error {
	return s.db.Where("household_id = ?", householdID).Delete(&model.Store{}, id).Error
}
