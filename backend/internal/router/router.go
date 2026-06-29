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
	householdSvc := service.NewHouseholdService(db)
	productSvc := service.NewProductService(db)
	storeSvc := service.NewStoreService(db)
	priceEntrySvc := service.NewPriceEntryService(db)
	purchaseSvc := service.NewPurchaseService(db)
	imageSvc := service.NewProductImageService(db)

	authH := handler.NewAuthHandler(userSvc, householdSvc, jwtSecret)
	adminH := handler.NewAdminHandler(userSvc)
	householdH := handler.NewHouseholdHandler(householdSvc)
	productH := handler.NewProductHandler(productSvc)
	storeH := handler.NewStoreHandler(storeSvc)
	priceEntryH := handler.NewPriceEntryHandler(priceEntrySvc)
	purchaseH := handler.NewPurchaseHandler(purchaseSvc)
	imageH := handler.NewProductImageHandler(imageSvc, uploadDir)

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
		// Self-service account update (any authenticated user)
		protected.PATCH("/auth/me", authH.UpdateMe)

		// Admin — master role only
		admin := protected.Group("/admin")
		admin.Use(middleware.RequireRole("master"))
		{
			admin.GET("/users", adminH.ListUsers)
			admin.PATCH("/users/:id", adminH.UpdateUser)
			admin.PATCH("/users/:id/role", adminH.UpdateUserRole)
			admin.DELETE("/users/:id", adminH.DeleteUser)
		}

		// Household
		household := protected.Group("/household")
		{
			household.GET("", householdH.Get)
			household.POST("/invite", householdH.GenerateInvite)
			household.POST("/join", householdH.AcceptInvite)
		}

		products := protected.Group("/products")
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

		stores := protected.Group("/stores")
		{
			stores.GET("", storeH.List)
			stores.POST("", storeH.Create)
			stores.GET("/:id", storeH.Get)
			stores.PATCH("/:id", storeH.Update)
			stores.DELETE("/:id", storeH.Delete)
		}

		protected.POST("/prices", priceEntryH.Create)
		protected.PATCH("/prices/:id", priceEntryH.Update)
		protected.DELETE("/prices/:id", priceEntryH.Delete)

		protected.GET("/purchases", purchaseH.List)
		protected.POST("/purchases", purchaseH.Create)
		protected.PATCH("/purchases/:id", purchaseH.Update)
		protected.DELETE("/purchases/:id", purchaseH.Delete)

		protected.DELETE("/images/:id", imageH.Delete)
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
