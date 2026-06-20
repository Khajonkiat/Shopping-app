package handler

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"wiki-shopping-app/backend/internal/model"
	"wiki-shopping-app/backend/internal/service"

	"github.com/gin-gonic/gin"
)

const maxImageSize = 10 << 20 // 10 MB

var allowedMIME = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/gif":  ".gif",
	"image/webp": ".webp",
}

type ProductImageHandler struct {
	svc       *service.ProductImageService
	uploadDir string
}

func NewProductImageHandler(svc *service.ProductImageService, uploadDir string) *ProductImageHandler {
	return &ProductImageHandler{svc: svc, uploadDir: uploadDir}
}

func (h *ProductImageHandler) List(c *gin.Context) {
	productID, err := parseID(c, "id")
	if err != nil {
		return
	}
	images, err := h.svc.ListByProduct(productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, images)
}

func (h *ProductImageHandler) Upload(c *gin.Context) {
	productID, err := parseID(c, "id")
	if err != nil {
		return
	}

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxImageSize)
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file required (max 10 MB)"})
		return
	}
	defer file.Close()

	// Detect MIME type from first 512 bytes.
	buf := make([]byte, 512)
	n, err := file.Read(buf)
	if err != nil && err != io.EOF {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read file"})
		return
	}
	mime := http.DetectContentType(buf[:n])
	ext, ok := allowedMIME[mime]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("unsupported file type: %s", mime)})
		return
	}
	_ = header // filename from client is not trusted; we generate our own

	// Seek back so we can copy the full file.
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}

	filename, err := randomFilename(ext)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate filename"})
		return
	}

	dst, err := os.Create(filepath.Join(h.uploadDir, filename))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		os.Remove(filepath.Join(h.uploadDir, filename))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	image := &model.ProductImage{ProductID: productID, Filename: filename}
	if err := h.svc.Create(image); err != nil {
		os.Remove(filepath.Join(h.uploadDir, filename))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, image)
}

func (h *ProductImageHandler) Delete(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}
	filename, err := h.svc.Delete(id)
	if err != nil {
		if h.svc.IsNotFound(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "image not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	os.Remove(filepath.Join(h.uploadDir, filename))
	c.Status(http.StatusNoContent)
}

func randomFilename(ext string) (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b) + ext, nil
}
