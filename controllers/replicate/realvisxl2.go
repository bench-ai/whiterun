package replicate

import (
	"ApiExecutor/cloud"
	"ApiExecutor/controllers"
	"ApiExecutor/miscellaneous"
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"os"
)

type apiParameters struct {
	Prompt               string
	NegativePrompt       string `json:"negative_prompt"`
	CfgScale             uint8  `json:"cfg_scale"`
	GuidanceScale        uint8  `json:"guidance_scale"`
	Scheduler            string
	Seed                 *uint64
	NumInferenceSteps    uint8   `json:"num_inference_steps"`
	PromptStrength       float32 `json:"prompt_strength"`
	Image                string
	Mask                 string
	DisableSafetyChecker bool `json:"disable_safety_checker"`
}

func (a *apiParameters) validateScheduler() int8 {
	schedulerSet := map[string]struct{}{
		"DDIM":               {},
		"DPMSolverMultistep": {},
		"HeunDiscrete":       {},
		"KarrasDPM":          {},
		"K_EULER_ANCESTRAL":  {},
		"K_EULER":            {},
		"PNDM":               {},
	}

	_, ok := schedulerSet[a.Scheduler]

	return miscellaneous.CastBoolToInt(ok)
}

func (a *apiParameters) validateGuidanceScale() int8 {
	inRange := miscellaneous.InRange[int8]
	return miscellaneous.CastBoolToInt(inRange(
		int8(a.GuidanceScale),
		1,
		50,
		true,
		true))
}

func (a *apiParameters) validatePromptStrength() int8 {
	inRange := miscellaneous.InRange[float32]

	return miscellaneous.CastBoolToInt(inRange(
		a.PromptStrength,
		0.0,
		1.0,
		true,
		true))
}

func (a *apiParameters) validateInferenceSteps() int8 {
	inRange := miscellaneous.InRange[int8]
	return miscellaneous.CastBoolToInt(inRange(
		int8(a.NumInferenceSteps),
		0,
		100,
		true,
		true))
}

func (a *apiParameters) PostBodyText() map[string]interface{} {
	validationArr := [3]int8{
		a.validatePromptStrength(),
		a.validateGuidanceScale(),
		a.validateScheduler(),
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
				"version": os.Getenv("REALVIS2XL"),
				"input": map[string]interface{}{
					"width":                  1024,
					"height":                 1024,
					"prompt":                 a.Prompt,
					"negative_prompt":        a.NegativePrompt,
					"num_outputs":            1,
					"scheduler":              a.Scheduler,
					"guidance_scale":         a.GuidanceScale,
					"apply_watermark":        true,
					"disable_safety_checker": a.DisableSafetyChecker,
					"num_inference_steps":    a.NumInferenceSteps,
				},
			},
		}

		if a.Seed != nil {
			if body, ok := postMap["body"].(map[string]interface{}); ok {
				if input, ok := body["input"].(map[string]interface{}); ok {
					input["seed"] = *a.Seed
				} else {
					return nil
				}

			} else {
				return nil
			}
		}

		return postMap
	}
}

type extendedResponse interface {
	controllers.ResponseStruct
}

type responseSuccess struct{}

func (r *responseSuccess) Failure(response *http.Response) *controllers.Failed {
	var body struct {
		Detail string
		Title  string
		Status string
	}

	fmt.Println("here")

	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		fmt.Println(body)
	} else {
		fmt.Println(err)
	}

	return &controllers.Failed{}
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
		CompletedAt *string `json:"completed_at"`
		CreatedAt   string  `json:"created_at"`
		Error       *string
		Id          string
		Input       map[string]interface{}
		Logs        *string
		Output      *string
		StartedAt   *string `json:"started_at"`
		Status      string
		Model       string
		Version     string
	}

	if err := json.NewDecoder(pResponse.Body).Decode(&response); err != nil {
		channelMap["error"] = err.Error()
	} else {

		mode := os.Getenv("DEV")
		url := ""
		if mode != "true" {
			url = "https://app.bench-ai.com/api/replicate?imageId=%s"
		} else {
			url = "http://localhost:8080/api/replicate?imageId=%s"
		}

		continueUrl := fmt.Sprintf(url, response.Id)
		channelMap["url"] = continueUrl
		channel <- channelMap
	}
}

func RealVizTextToImage(c *gin.Context) {
	var body apiParameters
	var err error

	if err = c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	request := body.PostBodyText()

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
		"text-to-image",
		"replicate/lucataco/realvisxl-v2.0",
		&responseSuccess{}); ero != nil {

		c.String(http.StatusBadRequest, ero.Error())
		return

	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}
}

func CollectReplicateImage(c *gin.Context) {

	imageId := c.Query("imageId")

	if imageId == "" {
		c.String(http.StatusBadRequest, "id not provided")
		return
	}

	url := fmt.Sprintf("https://api.replicate.com/v1/predictions/%s", imageId)

	newReq, _ := http.NewRequest("GET", url, nil)
	apiKey := os.Getenv("REP")

	newReq.Header.Add("Content-Type", "application/json")
	newReq.Header.Add("Authorization", "Token "+apiKey)

	pResponse, er := http.DefaultClient.Do(newReq)

	if er != nil {
		c.String(http.StatusInternalServerError, "unable to process and handle request")
	}

	var dataBody struct {
		Id          string
		Model       string
		Version     string
		Input       map[string]interface{}
		Output      []string
		Logs        string
		Error       string
		Status      string
		CompletedAt *string `json:"completed_at"`
	}

	if err := json.NewDecoder(pResponse.Body).Decode(&dataBody); err != nil {
		c.String(http.StatusInternalServerError, "unable to process and handle request")
		return
	} else {
		if dataBody.CompletedAt == nil {
			c.String(http.StatusAccepted, "still processing")
		} else {
			if dataBody.Status == "failed" {
				c.String(http.StatusBadRequest, dataBody.Error)
			} else {
				if dataBody.Output == nil {
					c.String(http.StatusBadRequest, "we have been lied too")
				} else {
					uuidString := uuid.New().String()
					uuidString += "-bench.png"
					err = cloud.UploadUrlToS3(dataBody.Output[0], uuidString)

					if err != nil {
						c.String(http.StatusInternalServerError, "unable to save image")
						return
					}

					err, url = cloud.GetPresignedURL(uuidString)

					if err != nil {
						c.String(http.StatusInternalServerError, "unable to save image")
						return
					}

					c.JSON(http.StatusOK, gin.H{"url": url})
					return

				}
			}
		}
	}
}
