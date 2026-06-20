package handler

import (
	"net/http"
	"time"
	"wiki-shopping-app/backend/internal/model"
	"wiki-shopping-app/backend/internal/service"

	"github.com/gin-gonic/gin"
)

type PriceEntryHandler struct {
	svc *service.PriceEntryService
}

func NewPriceEntryHandler(svc *service.PriceEntryService) *PriceEntryHandler {
	return &PriceEntryHandler{svc: svc}
}

func (h *PriceEntryHandler) ListByProduct(c *gin.Context) {
	productID, err := parseID(c, "id")
	if err != nil {
		return
	}
	entries, err := h.svc.ListByProduct(productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, entries)
}

func (h *PriceEntryHandler) Create(c *gin.Context) {
	var entry model.PriceEntry
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if entry.RecordedAt.IsZero() {
		entry.RecordedAt = time.Now()
	}
	if entry.SourceType == "" {
		entry.SourceType = model.SourceTypeManual
	}
	if err := h.svc.Create(&entry); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, entry)
}

func (h *PriceEntryHandler) Update(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}
	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	entry, err := h.svc.Update(id, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, entry)
}

func (h *PriceEntryHandler) Delete(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}
	if err := h.svc.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
