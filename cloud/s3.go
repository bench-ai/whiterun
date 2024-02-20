package cloud

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

func UploadToS3fromBase64PNG(data, objectKey string) error {
	return UploadToS3fromBase64(data, objectKey, "image/png")
}

func UploadToS3fromBase64MP4(data, objectKey string) error {
	return UploadToS3fromBase64(data, objectKey, "video/mp4")
}

func UploadToS3fromBase64(data, objectKey, annotation string) error {
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
		ContentType: aws.String(annotation), // required. Notice the back ticks
	})

	return err
}

func UploadToS3FromMultiPart(file *multipart.FileHeader, objectKey, contentType string) error {

	fileContent, err := file.Open()
	if err != nil {
		return err
	}
	defer fileContent.Close()

	// Specify the S3 bucket name and region
	bucketName := os.Getenv("AWS_BUCKET")
	client, err := GetClient()

	if err != nil {
		panic(err)
	}

	// Upload the file to S3
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(objectKey),
		Body:        fileContent,
		ContentType: aws.String(contentType), // required. Notice the back ticks
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

func downloadUrlToBase64(downloadUrl string) (error, string) {
	response, err := http.Get(downloadUrl)
	if err != nil {
		return err, ""
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to download image, status code: %d", response.StatusCode), ""
	}

	data, err := io.ReadAll(response.Body)
	if err != nil {
		return err, ""
	}

	return nil, base64.StdEncoding.EncodeToString(data)
}

func UploadUrlToS3(fileUrl, s3ObjectKey, annotation string) error {
	err, base64Str := downloadUrlToBase64(fileUrl)

	if err != nil {
		return err
	}

	switch annotation {
	case "png":
		return UploadToS3fromBase64PNG(base64Str, s3ObjectKey)
	case "mp4":
		return UploadToS3fromBase64MP4(base64Str, s3ObjectKey)
	default:
		return fmt.Errorf("%s is not a valid type", annotation)
	}
}
