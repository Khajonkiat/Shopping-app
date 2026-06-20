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

func (s *StoreService) List() ([]model.Store, error) {
	var stores []model.Store
	if err := s.db.Find(&stores).Error; err != nil {
		return nil, err
	}
	return stores, nil
}

func (s *StoreService) GetByID(id uint) (*model.Store, error) {
	var store model.Store
	if err := s.db.First(&store, id).Error; err != nil {
		return nil, err
	}
	return &store, nil
}

func (s *StoreService) Create(store *model.Store) error {
	return s.db.Create(store).Error
}

func (s *StoreService) Update(id uint, updates map[string]any) (*model.Store, error) {
	var store model.Store
	if err := s.db.First(&store, id).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&store).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &store, nil
}

func (s *StoreService) Delete(id uint) error {
	return s.db.Delete(&model.Store{}, id).Error
}
