package cloud

import (
	"bytes"
	"context"
	"encoding/base64"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"io"
	"os"
	"time"
)

func UploadToS3fromBase64(data string, objectKey string) error {

	// Specify the S3 bucket name and region
	bucketName := os.Getenv("AWS_BUCKET")
	client, err := GetClient()

	if err != nil {
		panic(err)
	}

	decode, err := base64.StdEncoding.DecodeString(data)

	if err != nil {
		return err
	}

	// Upload the file to S3
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(objectKey),
		Body:        bytes.NewReader(decode),
		ContentType: aws.String("image/png"), // required. Notice the back ticks
	})

	return err
}

func GetPresignedURL(keyName string) (error, string) {
	client, err := GetClient()

	if err != nil {
		return err, ""
	}

	bucketName := os.Getenv("AWS_BUCKET")

	presignedClient := s3.NewPresignClient(client)

	presignedUrl, err := presignedClient.PresignGetObject(context.Background(),
		&s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(keyName),
		},
		s3.WithPresignExpires(time.Minute*60))

	if err != nil {
		return err, ""
	}

	return nil, presignedUrl.URL
}

func DownloadFromS3(objectKey string) ([]byte, error) {

	// Specify the S3 bucket name and region
	bucketName := os.Getenv("AWS_BUCKET")
	client, err := GetClient()

	if err != nil {
		panic(err)
	}

	// Upload the file to S3
	output, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})

	if err != nil {
		return nil, err
	}

	defer func(Body io.ReadCloser) {
		err = Body.Close()
		if err != nil {
			panic(err)
		}
	}(output.Body)

	fileContent, err := io.ReadAll(output.Body)

	if err != nil {
		return nil, err
	}

	return fileContent, nil
}
