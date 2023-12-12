package main

import (
	"ApiExecutor/controllers"
	"ApiExecutor/db"
	"ApiExecutor/middleware"
	"context"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"os"
	"os/signal"
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

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"} // Replace with your frontend URL
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	r.Use(cors.New(config))

	r.POST("api/auth/signup", controllers.Signup)
	r.POST("api/auth/login", controllers.Login)
	r.POST("api/auth/test", middleware.CheckAccess, controllers.Test)
	r.POST("api/auth/refresh", controllers.RefreshToken)

	if err := r.Run(":8080"); err != nil {
		fmt.Println("Unable to start server")
		panic(err)
	} // listen and serve on 0.0.0.0:8080
}
