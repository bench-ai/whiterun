package db

import (
	"context"
	"errors"
	"fmt"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
)

var (
	client      *mongo.Client
	initialized bool
)

func InitMongoClient() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("No ..env file found")
		panic(err)
	}

	var connectionUri string

	if os.Getenv("DEV") == "true" {
		username := os.Getenv("MONGO_USERNAME")
		password := os.Getenv("MONGO_PASSWORD")
		port := os.Getenv("MONGO_PORT")
		uri := os.Getenv("MONGO_URI")
		connectionUri = fmt.Sprintf(uri, username, password, port)
	} else {
		connectionUri = os.Getenv("MONGO_URI")
	}

	var err error
	client, err = mongo.Connect(context.TODO(), options.Client().ApplyURI(connectionUri))
	if err != nil {
		fmt.Println("Unable to maintain a connection to MongoDB")
		panic(err)
	}

	// Ensure that the client can connect to the MongoDB server
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		fmt.Println("Failed to connect to MongoDB")
		panic(err)
	}

	initialized = true
}

func GetDatabaseClient() (*mongo.Database, error) {
	fmt.Println(initialized)
	if initialized {
		database := os.Getenv("MONGO_DATABASE_NAME")
		return client.Database(database), nil
	} else {
		return nil, errors.New("database has not been initialized")
	}
}

func GetClient() (*mongo.Client, error) {
	if initialized {
		return client, nil
	} else {
		return nil, errors.New("client connection not established")
	}
}
