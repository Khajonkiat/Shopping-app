package handler

import (
	"errors"
	"net/http"
	"wiki-shopping-app/backend/internal/middleware"
	"wiki-shopping-app/backend/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HouseholdHandler struct {
	svc *service.HouseholdService
}

func NewHouseholdHandler(svc *service.HouseholdService) *HouseholdHandler {
	return &HouseholdHandler{svc: svc}
}

func (h *HouseholdHandler) Get(c *gin.Context) {
	householdID := getHouseholdID(c)
	household, err := h.svc.GetByID(householdID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "household not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, household)
}

func (h *HouseholdHandler) GenerateInvite(c *gin.Context) {
	householdID := getHouseholdID(c)
	invite, err := h.svc.GenerateInvite(householdID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, invite)
}

func (h *HouseholdHandler) AcceptInvite(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	uid, _ := userID.(uint)

	var body struct {
		Code string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	household, err := h.svc.AcceptInvite(body.Code, uid)
	if err != nil {
		if errors.Is(err, service.ErrInviteNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, household)
}

func getHouseholdID(c *gin.Context) uint {
	v, _ := c.Get(middleware.HouseholdIDKey)
	id, _ := v.(uint)
	return id
}
