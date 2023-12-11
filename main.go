package main

import (
	"ApiExecutor/controllers"
	"ApiExecutor/db"
	"ApiExecutor/middleware"
	"context"
	"fmt"
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

	r.POST("api/auth/signup", controllers.Signup)
	r.POST("api/auth/login", controllers.Login)
	r.POST("api/auth/test", middleware.CheckAccess, controllers.Test)

	if err := r.Run(); err != nil {
		fmt.Println("Unable to start server")
		panic(err)
	} // listen and serve on 0.0.0.0:8080
}
