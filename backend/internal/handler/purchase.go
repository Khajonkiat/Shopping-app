package handler

import (
	"net/http"
	"time"
	"wiki-shopping-app/backend/internal/model"
	"wiki-shopping-app/backend/internal/service"

	"github.com/gin-gonic/gin"
)

type PurchaseHandler struct {
	svc *service.PurchaseService
}

func NewPurchaseHandler(svc *service.PurchaseService) *PurchaseHandler {
	return &PurchaseHandler{svc: svc}
}

func (h *PurchaseHandler) List(c *gin.Context) {
	purchases, err := h.svc.List(getHouseholdID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, purchases)
}

func (h *PurchaseHandler) ListByProduct(c *gin.Context) {
	productID, err := parseID(c, "id")
	if err != nil {
		return
	}
	purchases, err := h.svc.ListByProduct(productID, getHouseholdID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, purchases)
}

func (h *PurchaseHandler) Create(c *gin.Context) {
	var purchase model.Purchase
	if err := c.ShouldBindJSON(&purchase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if purchase.PurchasedAt.IsZero() {
		purchase.PurchasedAt = time.Now()
	}
	purchase.HouseholdID = getHouseholdID(c)
	if err := h.svc.Create(&purchase); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, purchase)
}

func (h *PurchaseHandler) Update(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}
	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	purchase, err := h.svc.Update(id, getHouseholdID(c), updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, purchase)
}

func (h *PurchaseHandler) Delete(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}
	if err := h.svc.Delete(id, getHouseholdID(c)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
