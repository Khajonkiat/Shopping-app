package router

import (
	"net/http"
	"wiki-shopping-app/backend/internal/handler"
	"wiki-shopping-app/backend/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB, uploadDir string) *gin.Engine {
	r := gin.Default()

	r.Use(corsMiddleware())
	r.Static("/uploads", uploadDir)

	productSvc := service.NewProductService(db)
	storeSvc := service.NewStoreService(db)
	priceEntrySvc := service.NewPriceEntryService(db)
	purchaseSvc := service.NewPurchaseService(db)
	imageSvc := service.NewProductImageService(db)

	productH := handler.NewProductHandler(productSvc)
	storeH := handler.NewStoreHandler(storeSvc)
	priceEntryH := handler.NewPriceEntryHandler(priceEntrySvc)
	purchaseH := handler.NewPurchaseHandler(purchaseSvc)
	imageH := handler.NewProductImageHandler(imageSvc, uploadDir)

	api := r.Group("/api/v1")

	products := api.Group("/products")
	{
		products.GET("", productH.List)
		products.POST("", productH.Create)
		products.GET("/:id", productH.Get)
		products.PATCH("/:id", productH.Update)
		products.DELETE("/:id", productH.Delete)
		products.GET("/:id/prices", priceEntryH.ListByProduct)
		products.GET("/:id/purchases", purchaseH.ListByProduct)
		products.GET("/:id/images", imageH.List)
		products.POST("/:id/images", imageH.Upload)
	}

	stores := api.Group("/stores")
	{
		stores.GET("", storeH.List)
		stores.POST("", storeH.Create)
		stores.GET("/:id", storeH.Get)
		stores.PATCH("/:id", storeH.Update)
		stores.DELETE("/:id", storeH.Delete)
	}

	api.POST("/prices", priceEntryH.Create)
	api.PATCH("/prices/:id", priceEntryH.Update)
	api.DELETE("/prices/:id", priceEntryH.Delete)

	api.GET("/purchases", purchaseH.List)
	api.POST("/purchases", purchaseH.Create)
	api.PATCH("/purchases/:id", purchaseH.Update)
	api.DELETE("/purchases/:id", purchaseH.Delete)

	api.DELETE("/images/:id", imageH.Delete)

	return r
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
