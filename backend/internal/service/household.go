package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"
	"wiki-shopping-app/backend/internal/model"

	"gorm.io/gorm"
)

var ErrInviteNotFound = errors.New("invite not found or expired")
var ErrNotAdmin = errors.New("only the household admin can do this")

type HouseholdService struct {
	db *gorm.DB
}

func NewHouseholdService(db *gorm.DB) *HouseholdService {
	return &HouseholdService{db: db}
}

func (s *HouseholdService) Create(name string, adminID uint) (*model.Household, error) {
	household := &model.Household{Name: name, AdminID: adminID}
	if err := s.db.Create(household).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&model.User{}).Where("id = ?", adminID).Update("household_id", household.ID).Error; err != nil {
		return nil, err
	}
	return household, nil
}

// EnsureMasterHousehold creates a household for the master user if they don't have one,
// and migrates any pre-existing data (household_id = 0) into it.
func (s *HouseholdService) EnsureMasterHousehold(masterEmail string) error {
	var master model.User
	if err := s.db.Where("email = ?", masterEmail).First(&master).Error; err != nil {
		return err
	}
	if master.HouseholdID != 0 {
		return nil
	}
	household, err := s.Create(master.Username+"'s Home", master.ID)
	if err != nil {
		return err
	}
	// Migrate rows that predate multi-tenancy (household_id = 0) into master's household.
	hid := household.ID
	s.db.Model(&model.Product{}).Where("household_id = 0").Update("household_id", hid)
	s.db.Model(&model.Store{}).Where("household_id = 0").Update("household_id", hid)
	s.db.Model(&model.PriceEntry{}).Where("household_id = 0").Update("household_id", hid)
	s.db.Model(&model.Purchase{}).Where("household_id = 0").Update("household_id", hid)
	return nil
}

func (s *HouseholdService) Rename(id, callerID uint, name string) (*model.Household, error) {
	var h model.Household
	if err := s.db.First(&h, id).Error; err != nil {
		return nil, err
	}
	if h.AdminID != callerID {
		return nil, ErrNotAdmin
	}
	if err := s.db.Model(&h).Update("name", name).Error; err != nil {
		return nil, err
	}
	return s.GetByID(id)
}

func (s *HouseholdService) GetByID(id uint) (*model.Household, error) {
	var h model.Household
	if err := s.db.Preload("Members").First(&h, id).Error; err != nil {
		return nil, err
	}
	return &h, nil
}

func (s *HouseholdService) GenerateInvite(householdID uint) (*model.HouseholdInvite, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return nil, err
	}
	invite := &model.HouseholdInvite{
		HouseholdID: householdID,
		Code:        hex.EncodeToString(b),
		ExpiresAt:   time.Now().Add(7 * 24 * time.Hour),
	}
	if err := s.db.Create(invite).Error; err != nil {
		return nil, err
	}
	return invite, nil
}

func (s *HouseholdService) AcceptInvite(code string, userID uint) (*model.Household, error) {
	var invite model.HouseholdInvite
	err := s.db.Where("code = ? AND expires_at > ? AND used_at IS NULL", code, time.Now()).
		First(&invite).Error
	if err != nil {
		return nil, ErrInviteNotFound
	}
	now := time.Now()
	if err := s.db.Model(&invite).Update("used_at", &now).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&model.User{}).Where("id = ?", userID).
		Update("household_id", invite.HouseholdID).Error; err != nil {
		return nil, err
	}
	return s.GetByID(invite.HouseholdID)
}
