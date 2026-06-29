package service

import (
	"errors"
	"time"
	"wiki-shopping-app/backend/internal/model"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var ErrEmailTaken = errors.New("email already registered")
var ErrInvalidCredentials = errors.New("invalid email or password")
var ErrInvalidRole = errors.New("role must be 'master' or 'user'")

type AdminUserView struct {
	ID            uint      `json:"id"`
	Email         string    `json:"email"`
	Username      string    `json:"username"`
	Role          string    `json:"role"`
	HouseholdID   uint      `json:"household_id"`
	HouseholdName string    `json:"household_name"`
	CreatedAt     time.Time `json:"created_at"`
}

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// Register creates a new account with the default "user" role.
// The master role is never assigned through registration.
func (s *UserService) Register(email, username, password string) (*model.User, error) {
	var existing model.User
	if err := s.db.Where("email = ?", email).First(&existing).Error; err == nil {
		return nil, ErrEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Email:        email,
		Username:     username,
		PasswordHash: string(hash),
		Role:         "user",
	}
	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) Login(email, password string) (*model.User, error) {
	var user model.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, ErrInvalidCredentials
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}
	return &user, nil
}

func (s *UserService) listAllQuery() *gorm.DB {
	return s.db.Table("users").
		Select("users.id, users.email, users.username, users.role, users.household_id, users.created_at, COALESCE(households.name, '') AS household_name").
		Joins("LEFT JOIN households ON households.id = users.household_id AND households.deleted_at IS NULL").
		Where("users.deleted_at IS NULL").
		Order("users.id ASC")
}

func (s *UserService) ListAll() ([]AdminUserView, error) {
	var views []AdminUserView
	return views, s.listAllQuery().Scan(&views).Error
}

func (s *UserService) UpdateRole(id uint, role string) (*AdminUserView, error) {
	if role != "master" && role != "user" {
		return nil, ErrInvalidRole
	}
	if err := s.db.Model(&model.User{}).Where("id = ?", id).Update("role", role).Error; err != nil {
		return nil, err
	}
	var view AdminUserView
	return &view, s.listAllQuery().Where("users.id = ?", id).Scan(&view).Error
}

func (s *UserService) UpdateUser(id uint, username, email, role, password string) (*AdminUserView, error) {
	if role != "master" && role != "user" {
		return nil, ErrInvalidRole
	}

	var user model.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, err
	}

	// Email uniqueness check — skip if unchanged.
	if email != user.Email {
		var conflict model.User
		if err := s.db.Where("email = ? AND id != ?", email, id).First(&conflict).Error; err == nil {
			return nil, ErrEmailTaken
		}
	}

	updates := map[string]any{
		"username": username,
		"email":    email,
		"role":     role,
	}
	if password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		updates["password_hash"] = string(hash)
	}

	if err := s.db.Model(&user).Updates(updates).Error; err != nil {
		return nil, err
	}

	var view AdminUserView
	return &view, s.listAllQuery().Where("users.id = ?", id).Scan(&view).Error
}

func (s *UserService) DeleteUser(id uint) error {
	return s.db.Delete(&model.User{}, id).Error
}

func (s *UserService) UpdateSelf(id uint, username, password string) (*model.User, error) {
	var user model.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	updates := map[string]any{"username": username}
	if password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		updates["password_hash"] = string(hash)
	}
	if err := s.db.Model(&user).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// EnsureMaster creates the master account if one does not yet exist.
// If the given email already exists as a non-master account it is promoted.
// Safe to call on every startup (idempotent).
func (s *UserService) EnsureMaster(email, username, password string) error {
	// Already have a master — nothing to do.
	var master model.User
	if err := s.db.Where("role = ?", "master").First(&master).Error; err == nil {
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// If the email already exists (registered as user), promote it.
	var existing model.User
	if err := s.db.Where("email = ?", email).First(&existing).Error; err == nil {
		return s.db.Model(&existing).Updates(map[string]any{
			"role":          "master",
			"password_hash": string(hash),
			"username":      username,
		}).Error
	}

	// Create a fresh master account.
	return s.db.Create(&model.User{
		Email:        email,
		Username:     username,
		PasswordHash: string(hash),
		Role:         "master",
	}).Error
}
