package service

import (
	"errors"
	"wiki-shopping-app/backend/internal/model"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var ErrEmailTaken = errors.New("email already registered")
var ErrInvalidCredentials = errors.New("invalid email or password")

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
