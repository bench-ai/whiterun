package main

import (
	"ApiExecutor/controllers"
	"ApiExecutor/controllers/stability"
	"ApiExecutor/db"
	"ApiExecutor/middleware"
	"context"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"os"
	"os/signal"
	"strings"
	"syscall"
)

// runs before the main function when using gin

func init() {
	// establishes a connection to mongo DB
	db.InitMongoClient()
}

// severs mongodb connection when shutting down server
func handleShutdown() {
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	client, err := db.GetClient()

	if err != nil {
		panic(err)
	}

	<-sigCh
	fmt.Println("\nReceived shutdown signal. Closing MongoDB client...")

	// Disconnect MongoDB client
	if err := client.Disconnect(context.TODO()); err != nil {
		fmt.Println("Error disconnecting MongoDB client:", err)
	}

	os.Exit(0)
}

func main() {
	go handleShutdown()
	r := gin.Default()

	mode := os.Getenv("DEV")
	var backend string
	var address string

	if mode == "true" {
		config := cors.DefaultConfig()
		config.AllowOrigins = []string{"http://localhost:3000"} // Replace with your frontend URL
		config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
		config.AllowCredentials = true
		config.AllowHeaders = append(config.AllowHeaders, "Authorization")
		r.Use(cors.New(config))
		backend = os.Getenv("D_BACKEND_PORT")
		address = ":%s"
	} else {
		backend = os.Getenv("P_BACKEND_PORT")
		r.Use(static.Serve("/", static.LocalFile("./whiterun-ui/build", true)))
		r.NoRoute(func(c *gin.Context) {
			if !strings.HasPrefix(c.Request.RequestURI, "/api") {
				c.File("./whiterun-ui/build/index.html")
			}
			//default 404 page not found
		})
		address = "0.0.0.0:%s"
	}

	address = fmt.Sprintf(address, backend)

	r.POST("api/auth/signup", controllers.Signup)
	r.POST("api/auth/login", controllers.Login)
	r.POST("api/auth/test", middleware.CheckAccess, controllers.Test)
	r.POST("api/auth/refresh", controllers.RefreshToken)
	r.POST("api/auth/logout", controllers.Logout)
	r.GET("api/user/details", middleware.CheckAccess, controllers.User)
	r.Any("api/proxy", controllers.Proxy)
	r.POST("api/stability/text-to-image", middleware.CheckExecutionAccess, stability.TextToImage)
	r.POST("api/stability/image-to-image", middleware.CheckExecutionAccess, stability.ImageToImage)

	if err := r.Run(address); err != nil {
		fmt.Println("Unable to start server")
		panic(err)
	} // listen and serve on 0.0.0.0:8080
}
