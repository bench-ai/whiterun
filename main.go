package main

import (
	"ApiExecutor/cloud"
	"ApiExecutor/controllers"
	"ApiExecutor/controllers/chatgpt"
	"ApiExecutor/controllers/dalle"
	"ApiExecutor/controllers/replicate"
	"ApiExecutor/controllers/stability"
	"ApiExecutor/db"
	"ApiExecutor/elevenlabs"
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
	cloud.InitAWSConfig()
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

	// Limit the file size to 15 mb
	r.MaxMultipartMemory = 15 << 20

	mode := os.Getenv("DEV")
	var backend string
	var address string

	config := cors.DefaultConfig()

	if mode == "true" {
		fmt.Println("In Development mode")
		config.AllowOrigins = []string{"http://localhost:3000"} // Replace with your frontend URL
		backend = os.Getenv("D_BACKEND_PORT")
	} else {
		fmt.Println("In Production mode")
		config.AllowOrigins = []string{
			"https://app.bench-ai.com/",
			"https://whiterun-6hke4.ondigitalocean.app",
		}

		backend = os.Getenv("P_BACKEND_PORT")
		r.Use(static.Serve("/", static.LocalFile("./whiterun-ui/build", true)))
		r.NoRoute(func(c *gin.Context) {
			if !strings.HasPrefix(c.Request.RequestURI, "/api") {
				c.File("./whiterun-ui/build/index.html")
			}
		})
	}

	address = ":%s"

	fmt.Println(address)

	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}
	config.AllowCredentials = true
	config.AllowHeaders = append(config.AllowHeaders, "Authorization")
	r.Use(cors.New(config))

	address = fmt.Sprintf(address, backend)

	// auth
	r.POST("api/auth/signup", controllers.Signup)
	r.POST("api/auth/login", controllers.Login)
	r.POST("api/auth/test", middleware.CheckAccess, controllers.Test)
	r.POST("api/auth/refresh", controllers.RefreshToken)
	r.POST("api/auth/logout", controllers.Logout)

	// user
	r.GET("api/user/details", middleware.CheckAccess, controllers.User)

	// proxy
	r.Any("api/proxy", controllers.Proxy)

	// stability ai
	r.POST("api/stability/text-to-image", middleware.CheckExecutionAccess, stability.TextToImage)
	r.POST("api/stability/image-to-image", middleware.CheckExecutionAccess, stability.ImageToImage)
	r.POST("api/stability/image-to-image/upscale", middleware.CheckExecutionAccess, stability.ImageToImageUpscale)
	r.POST("api/stability/image-to-image/mask", middleware.CheckExecutionAccess, stability.ImageToImageMask)

	// workflows
	r.POST("api/workflows/new", middleware.CheckAccess, controllers.CreateWorkflow)
	r.PATCH("api/workflows/save", middleware.CheckAccess, controllers.SaveWorkflow)
	r.GET("api/workflows", middleware.CheckWorkflowAccess, controllers.GetWorkFlow)

	// upload
	r.POST("api/upload/image", middleware.CheckExecutionAccess, controllers.UploadImageFile)

	// Dall E
	r.POST("api/dall-e/text-to-image", middleware.CheckExecutionAccess, dalle.TextToImage)

	//Replicate
	r.GET("api/replicate/", replicate.CollectReplicateImage)

	// Realistic Vision
	r.POST("api/replicate/realvisxl2/text-to-image", middleware.CheckExecutionAccess, replicate.RealVizTextToImage)

	// high-resolution-controlnet-tile
	r.POST("api/replicate/hrcnettile11/upscale", middleware.CheckExecutionAccess, replicate.UpscaleControlNetTile11)
	r.GET("api/replicate", replicate.CollectReplicateImage)

	//Photo maker
	r.POST("api/replicate/tencentarc/photomaker", middleware.CheckExecutionAccess, replicate.PhotoMaker)

	//i2vgen
	r.POST("api/replicate/ali-vilab/i2vgen-xl", middleware.CheckExecutionAccess, replicate.I2vgenxl)

	//GPT
	r.POST("api/openai/gpt", middleware.CheckExecutionAccess, chatgpt.Gpt)
	r.POST("api/openai/prompt/generator", middleware.CheckExecutionAccess, chatgpt.PromptGenerator)

	//ELEVEN
	r.POST("api/eleven/list-voices", elevenlabs.CollectVoiceList)

	if err := r.Run(address); err != nil {
		fmt.Println("Unable to start server")
		panic(err)
	} // listen and serve on 0.0.0.0:8080
}
