package dalle

import (
	"ApiExecutor/cloud"
	"ApiExecutor/controllers"
	"ApiExecutor/miscellaneous"
	"bytes"
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

type apiParameters struct {
	SampleCount    int8
	Model          string
	Quality        string
	ResponseFormat string
	Size           string
	Style          string
	Prompt         string
}

type responseSuccess struct{}

type extendedResponse interface {
	controllers.ResponseStruct
}

func (r *responseSuccess) Success(
	pResponse *http.Response,
	channel chan map[string]string,
	fileName string) {

	channelMap := map[string]string{
		"type":  "upload",
		"url":   "",
		"error": "",
	}

	var response struct {
		Created int64
		Data    []map[string]string
	}

	if err := json.NewDecoder(pResponse.Body).Decode(&response); err != nil {
		channelMap["error"] = err.Error()
	} else {

		if len(response.Data) == 0 {
			channelMap["error"] = "no image was given"
			channel <- channelMap
			return
		}

		data, ok := response.Data[0]["b64_json"]

		if ok {
			if err = cloud.UploadToS3fromBase64(data, fileName); err != nil {
				channelMap["error"] = err.Error()
				channel <- channelMap
				return
			}

			er, url := cloud.GetPresignedURL(fileName)

			if er == nil {
				channelMap["url"] = url
			} else {
				channelMap["error"] = er.Error()
			}

		} else {
			channelMap["error"] = "response does not contain base64"
		}

		channel <- channelMap
	}
}

func (r *responseSuccess) Failure(response *http.Response) *controllers.Failed {
	var body struct {
		Error struct {
			Code    int8
			Message string
			Param   string
			Type    string
		}
	}

	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		return nil
	}

	return &controllers.Failed{
		Message: body.Error.Message,
		Id:      body.Error.Type,
		Name:    body.Error.Type,
	}
}

func allowedSizes(size string) int8 {
	sizeSet := map[string]struct{}{
		"1024x1024": {},
		"1792x1024": {},
		"1024x1792": {},
	}

	_, ok := sizeSet[size]
	return miscellaneous.CastBoolToInt(ok)
}

func allowedStyle(style string) int8 {
	sizeSet := map[string]struct{}{
		"vivid":   {},
		"natural": {},
	}

	_, ok := sizeSet[style]
	return miscellaneous.CastBoolToInt(ok)
}

func allowedQuality(quality string) int8 {
	sizeSet := map[string]struct{}{
		"hd":       {},
		"standard": {},
	}

	_, ok := sizeSet[quality]
	return miscellaneous.CastBoolToInt(ok)
}

func (d *apiParameters) fillAndCheck() error {
	d.SampleCount = 1
	d.Model = "dall-e-3"
	d.ResponseFormat = "b64_json"

	boolList := [3]int8{
		allowedQuality(d.Quality),
		allowedStyle(d.Style),
		allowedSizes(d.Size),
	}

	sum := miscellaneous.Sum[int8]

	total := sum(boolList[:])

	if total != 3 {
		return errors.New("invalid quality, style or size")
	}
	return nil
}

func TextToImage(c *gin.Context) {
	var body apiParameters

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if err := body.fillAndCheck(); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	postMap := map[string]interface{}{
		"body": map[string]interface{}{
			"prompt":          body.Prompt,
			"model":           body.Model,
			"n":               body.SampleCount,
			"quality":         body.Quality,
			"response_format": body.ResponseFormat,
			"style":           body.Style,
			"size":            body.Size,
		},
		"header": map[string]interface{}{
			"Content-Type":  "application/json",
			"Accept":        "application/json",
			"Authorization": "Bearer ",
		},
	}

	postBody, err := json.Marshal(postMap["body"])

	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	url := "https://api.openai.com/v1/images/generations"

	responseBody := bytes.NewBuffer(postBody)
	newReq, _ := http.NewRequest("POST", url, responseBody)
	apiKey := os.Getenv("OPEN_AI")

	newReq.Header.Add("Content-Type", "application/json")
	newReq.Header.Add("Authorization", "Bearer "+apiKey)

	if ero, urll := controllers.ExecuteImageRequest(
		newReq,
		c,
		postMap,
		"text-to-image",
		"openai",
		&responseSuccess{}); ero != nil {

		c.String(http.StatusBadRequest, ero.Error())
		return

	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}
}
