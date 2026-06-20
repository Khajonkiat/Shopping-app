package router

import (
	"net/http"
	"wiki-shopping-app/backend/internal/handler"
	"wiki-shopping-app/backend/internal/middleware"
	"wiki-shopping-app/backend/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB, uploadDir string, jwtSecret string) *gin.Engine {
	r := gin.Default()

	r.Use(corsMiddleware())
	r.Static("/uploads", uploadDir)

	userSvc := service.NewUserService(db)
	productSvc := service.NewProductService(db)
	storeSvc := service.NewStoreService(db)
	priceEntrySvc := service.NewPriceEntryService(db)
	purchaseSvc := service.NewPurchaseService(db)
	imageSvc := service.NewProductImageService(db)

	authH := handler.NewAuthHandler(userSvc, jwtSecret)
	productH := handler.NewProductHandler(productSvc)
	storeH := handler.NewStoreHandler(storeSvc)
	priceEntryH := handler.NewPriceEntryHandler(priceEntrySvc)
	purchaseH := handler.NewPurchaseHandler(purchaseSvc)
	imageH := handler.NewProductImageHandler(imageSvc, uploadDir)

	masterOnly := middleware.RequireRole("master")

	api := r.Group("/api/v1")

	// Public auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
	}

	// All other routes require a valid JWT
	protected := api.Group("")
	protected.Use(middleware.Auth(jwtSecret))
	{
		products := protected.Group("/products")
		{
			products.GET("", productH.List)
			products.POST("", masterOnly, productH.Create)
			products.GET("/:id", productH.Get)
			products.PATCH("/:id", masterOnly, productH.Update)
			products.DELETE("/:id", masterOnly, productH.Delete)
			products.GET("/:id/prices", priceEntryH.ListByProduct)
			products.GET("/:id/purchases", purchaseH.ListByProduct)
			products.GET("/:id/images", imageH.List)
			products.POST("/:id/images", masterOnly, imageH.Upload)
		}

		stores := protected.Group("/stores")
		{
			stores.GET("", storeH.List)
			stores.POST("", masterOnly, storeH.Create)
			stores.GET("/:id", storeH.Get)
			stores.PATCH("/:id", masterOnly, storeH.Update)
			stores.DELETE("/:id", masterOnly, storeH.Delete)
		}

		protected.POST("/prices", masterOnly, priceEntryH.Create)
		protected.PATCH("/prices/:id", masterOnly, priceEntryH.Update)
		protected.DELETE("/prices/:id", masterOnly, priceEntryH.Delete)

		protected.GET("/purchases", purchaseH.List)
		protected.POST("/purchases", masterOnly, purchaseH.Create)
		protected.PATCH("/purchases/:id", masterOnly, purchaseH.Update)
		protected.DELETE("/purchases/:id", masterOnly, purchaseH.Delete)

		protected.DELETE("/images/:id", masterOnly, imageH.Delete)
	}

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
