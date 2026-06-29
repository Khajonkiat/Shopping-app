package handler

import (
	"errors"
	"net/http"
	"time"
	"wiki-shopping-app/backend/internal/middleware"
	"wiki-shopping-app/backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthHandler struct {
	svc          *service.UserService
	householdSvc *service.HouseholdService
	jwtSecret    string
}

func NewAuthHandler(svc *service.UserService, householdSvc *service.HouseholdService, jwtSecret string) *AuthHandler {
	return &AuthHandler{svc: svc, householdSvc: householdSvc, jwtSecret: jwtSecret}
}

type registerRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.svc.Register(req.Email, req.Username, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrEmailTaken) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	household, err := h.householdSvc.Create(req.Username+"'s Home", user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	token, err := h.makeToken(user.ID, user.Email, user.Username, user.Role, household.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
		return
	}

	user.HouseholdID = household.ID
	c.JSON(http.StatusCreated, gin.H{"token": token, "user": user})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.svc.Login(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Auto-create a household for users who pre-date multi-tenancy.
	if user.HouseholdID == 0 {
		household, err := h.householdSvc.Create(user.Username+"'s Home", user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		user.HouseholdID = household.ID
	}

	token, err := h.makeToken(user.ID, user.Email, user.Username, user.Role, user.HouseholdID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

func (h *AuthHandler) UpdateMe(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	var body struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.svc.UpdateSelf(userID.(uint), body.Username, body.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	token, err := h.makeToken(user.ID, user.Email, user.Username, user.Role, user.HouseholdID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

func (h *AuthHandler) makeToken(userID uint, email, username, role string, householdID uint) (string, error) {
	claims := jwt.MapClaims{
		"user_id":      userID,
		"email":        email,
		"username":     username,
		"role":         role,
		"household_id": householdID,
		"exp":          time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(h.jwtSecret))
}
