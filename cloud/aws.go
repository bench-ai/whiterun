package cloud

import (
	"context"
	"errors"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"os"
)

var (
	s3client    *s3.Client
	initialized bool
)

func InitAWSConfig() {

	regionName := os.Getenv("AWS_REGION")
	cfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithRegion(regionName))

	if err != nil {
		initialized = false
		return
	}

	client := s3.NewFromConfig(cfg)

	if client == nil {
		initialized = false
		return
	}

	s3client = client
	initialized = true
}

func GetClient() (*s3.Client, error) {
	if initialized {
		return s3client, nil
	} else {
		return nil, errors.New("s3 client connection not established")
	}
}
