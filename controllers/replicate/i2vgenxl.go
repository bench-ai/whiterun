package replicate

import (
	"ApiExecutor/cloud"
	"ApiExecutor/controllers"
	"ApiExecutor/miscellaneous"
	"bytes"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

type apiParametersI2 struct {
	Prompt            string
	GuidanceScale     uint8 `json:"guidance_scale"`
	Seed              *uint64
	NumInferenceSteps uint8 `json:"num_inference_steps"`
	Image             string
	MaxFrames         uint8 `json:"max_frames"`
}

func (a *apiParametersI2) validateGuidanceScale() int8 {
	inRange := miscellaneous.InRange[uint8]
	return miscellaneous.CastBoolToInt(inRange(a.GuidanceScale, 1, 20, true, true))
}

func (a *apiParametersI2) validateNumInferenceSteps() int8 {
	inRange := miscellaneous.InRange[uint8]
	return miscellaneous.CastBoolToInt(
		inRange(a.NumInferenceSteps, 1, 50, true, true))
}

func (a *apiParametersI2) validateMaxFrames() int8 {
	inRange := miscellaneous.InRange[uint8]
	return miscellaneous.CastBoolToInt(
		inRange(a.MaxFrames, 2, 30, true, true))
}

func (a *apiParametersI2) PostBody() map[string]interface{} {
	validationArr := [3]int8{
		a.validateNumInferenceSteps(),
		a.validateGuidanceScale(),
		a.validateGuidanceScale(),
	}

	sum := miscellaneous.Sum[int8]

	if sum(validationArr[:]) != 3 {
		return nil
	} else {
		postMap := map[string]interface{}{
			"header": map[string]interface{}{
				"Content-Type":  "application/json",
				"Accept":        "application/json",
				"Authorization": "Bearer ",
			},
			"body": map[string]interface{}{
				"version": os.Getenv("I2VGENXL"),
				"input": map[string]interface{}{
					"prompt":              a.Prompt,
					"image":               a.Image,
					"max_frames":          a.MaxFrames,
					"guidance_scale":      a.GuidanceScale,
					"num_inference_steps": a.NumInferenceSteps,
				},
			},
		}

		if a.Seed != nil {
			postMap = setInnerMapValue(postMap, "seed", *a.Seed)
		}

		return postMap
	}
}

func I2vgenxl(c *gin.Context) {
	var body apiParametersI2
	var err error

	if err = c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if err, url := cloud.GetPresignedURL(body.Image); err != nil {
		c.String(http.StatusBadRequest, "image does not exist")
		return
	} else {
		body.Image = url
	}

	request := body.PostBody()

	if request == nil {
		c.String(http.StatusBadRequest, "failed")
		return
	}

	postBody, ok := request["body"].(map[string]interface{})

	var postBytes []byte

	if ok {
		postBytes, err = json.Marshal(postBody)

		if err != nil {
			c.String(http.StatusInternalServerError, "failed")
			return
		}
	}
	url := "https://api.replicate.com/v1/predictions"

	responseBody := bytes.NewBuffer(postBytes)
	newReq, _ := http.NewRequest("POST", url, responseBody)
	apiKey := os.Getenv("REP")

	newReq.Header.Add("Content-Type", "application/json")
	newReq.Header.Add("Authorization", "Token "+apiKey)

	if ero, urll := controllers.ExecuteImageRequest(
		newReq,
		c,
		postBody,
		"imageToVideo",
		"replicate/ali-vilab/i2vgen-xl",
		&responseSuccess{}); ero != nil {

		c.String(http.StatusBadRequest, ero.Error())
		return

	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}
}
