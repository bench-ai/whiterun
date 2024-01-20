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

type tileApiParameters struct {
	Prompt         string
	Image          string
	Resolution     uint16
	Resemblance    float32
	Creativity     float32
	Hdr            float32
	Scheduler      string
	Seed           *uint64
	Steps          uint16
	GuidanceScale  float32 `json:"guidance_scale"`
	GuessMode      bool    `json:"guess_mode"`
	NegativePrompt string  `json:"negative_prompt"`
}

func (t *tileApiParameters) validateResolution() int8 {
	return miscellaneous.CastBoolToInt(t.Resolution == 2048 || t.Resolution == 2560)
}

func (t *tileApiParameters) validateResemblance() int8 {
	rng := miscellaneous.InRange[float32]
	return miscellaneous.CastBoolToInt(rng(t.Resemblance, 0.0, 1.0, true, true))
}

func (t *tileApiParameters) validateCreativity() int8 {
	rng := miscellaneous.InRange[float32]
	return miscellaneous.CastBoolToInt(rng(t.Creativity, 0.0, 1.0, true, true))
}

func (t *tileApiParameters) validateHDR() int8 {
	rng := miscellaneous.InRange[float32]
	return miscellaneous.CastBoolToInt(rng(t.Hdr, 0.0, 1.0, true, true))
}

func (t *tileApiParameters) validateSteps() int8 {
	rng := miscellaneous.InRange[uint16]
	return miscellaneous.CastBoolToInt(rng(t.Steps, 1, 50, true, true))
}

func (t *tileApiParameters) validateGuidanceScale() int8 {
	rng := miscellaneous.InRange[float32]
	return miscellaneous.CastBoolToInt(rng(t.GuidanceScale, 1.0, 30.0, true, true))
}

func (t *tileApiParameters) validateScheduler() int8 {

	schedulerSet := map[string]struct{}{
		"DDIM":               {},
		"DPMSolverMultistep": {},
		"K_EULER_ANCESTRAL":  {},
		"K_EULER":            {},
	}

	_, ok := schedulerSet[t.Scheduler]
	return miscellaneous.CastBoolToInt(ok)
}

func (t *tileApiParameters) validate() bool {
	validArr := [7]int8{
		t.validateResolution(),
		t.validateResemblance(),
		t.validateCreativity(),
		t.validateHDR(),
		t.validateSteps(),
		t.validateGuidanceScale(),
		t.validateScheduler(),
	}

	sum := miscellaneous.Sum[int8]

	return sum(validArr[:]) == 7
}

func UpscaleControlNetTile11(c *gin.Context) {
	var body tileApiParameters
	var err error

	if err = c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if !body.validate() {
		c.String(http.StatusBadRequest, "invalid body")
		return
	}

	postMap := map[string]interface{}{
		"header": map[string]interface{}{
			"Content-Type":  "application/json",
			"Accept":        "application/json",
			"Authorization": "Bearer ",
		},
		"body": map[string]interface{}{
			"version": os.Getenv("HRCONTROLNETTILE11"),
			"input": map[string]interface{}{
				"prompt":          body.Prompt,
				"image":           body.Image,
				"resolution":      body.Resolution,
				"resemblance":     body.Resemblance,
				"creativity":      body.Creativity,
				"hdr":             body.Hdr,
				"scheduler":       body.Scheduler,
				"steps":           body.Steps,
				"guidance_scale":  body.GuidanceScale,
				"negative_prompt": body.NegativePrompt,
				"guess_mode":      body.GuessMode,
			},
		},
	}

	postBody, _ := postMap["body"].(map[string]interface{})
	input, _ := postBody["input"].(map[string]interface{})

	e, psUrl := cloud.GetPresignedURL(body.Image)

	if e != nil {
		c.String(http.StatusBadRequest, "Image does not exist")
		return
	} else {
		input["image"] = psUrl
	}

	if body.Seed != nil {
		input["seed"] = body.Seed
	}

	url := "https://api.replicate.com/v1/predictions"

	postBytes, err := json.Marshal(postBody)

	if err != nil {
		c.String(http.StatusInternalServerError, "failed")
		return
	}

	responseBody := bytes.NewBuffer(postBytes)
	newReq, _ := http.NewRequest("POST", url, responseBody)
	apiKey := os.Getenv("REP")

	newReq.Header.Add("Content-Type", "application/json")
	newReq.Header.Add("Authorization", "Token "+apiKey)

	if ero, urll := controllers.ExecuteImageRequest(
		newReq,
		c,
		postBody,
		"upscale",
		"replicate/batouresearch/high-resolution-controlnet-tile",
		&responseSuccess{}); ero != nil {

		c.String(http.StatusBadRequest, ero.Error())
		return

	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}

}
