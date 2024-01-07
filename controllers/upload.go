package controllers

import (
	"ApiExecutor/cloud"
	"ApiExecutor/miscellaneous"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"strings"
)

func UploadImageFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.String(http.StatusBadRequest, fmt.Sprintf("File upload failed: %s", err.Error()))
		return
	}

	ct := file.Header.Get("Content-Type")

	fmt.Println(ct)

	if validateFileType(file.Filename) != nil {
		c.String(http.StatusBadRequest, "invalid file type")
		return
	}

	if validateMimeType(ct) != nil {
		c.String(http.StatusBadRequest, "invalid file type")
		return
	}

	ext := strings.Split(ct, "/")[1]

	fileName, _ := uuid.NewUUID()
	fn := fileName.String()

	newFileName := fmt.Sprintf("%s.%s", fn, ext)

	err = cloud.UploadToS3FromMultiPart(file, newFileName, file.Header.Get("Content-Type"))

	if err != nil {
		c.String(http.StatusInternalServerError, "unable to upload file")
	} else {
		c.JSON(http.StatusOK, gin.H{
			"key": newFileName,
		})
	}
}

func validateFileType(fileName string) error {

	validExtensions := []string{
		"png", "jpg", "jpeg",
	}

	fileSplit := strings.Split(fileName, ".")

	fmt.Println(fileSplit)

	if len(fileSplit) < 2 {
		return errors.New("file does not appear to have a extension")
	}

	ext := strings.ToLower(fileSplit[len(fileSplit)-1])

	fmt.Println(ext)

	contains := miscellaneous.Contains[string]

	if !contains(ext, validExtensions) {
		return errors.New("file must be a png, jpg, or jpeg: %s")
	}

	return nil
}

func validateMimeType(contentType string) error {

	validExtensions := []string{
		"image/jpeg", "image/png", "image/jpg",
	}

	contains := miscellaneous.Contains[string]

	if !contains(contentType, validExtensions) {
		return errors.New("file must be a png, jpg, or jpeg: %s")
	}

	return nil
}
