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

type photomakerParameters struct {
	InputImage           string  `json:"input_image"`
	InputImage2          *string `json:"input_image2"`
	InputImage3          *string `json:"input_image3"`
	InputImage4          *string `json:"input_image4"`
	Prompt               string  `json:"prompt"`
	StyleName            string  `json:"style_name"`
	NegativePrompt       string  `json:"negative_prompt"`
	NumSteps             int8    `json:"num_steps"`
	StyleStrengthRatio   int8    `json:"style_strength_ratio"`
	GuidanceScale        int8    `json:"guidance_scale"`
	Seed                 *int32  `json:"seed"`
	DisableSafetyChecker bool    `json:"disable_safety_checker"`
}

func (p *photomakerParameters) validateStyle() int8 {
	style := [10]string{
		"Cinematic",
		"Digital Art",
		"Photographic (Default)",
		"Fantasy art",
		"Neonpunk",
		"Enhance",
		"Comic book",
		"Lowpoly",
		"Line art",
		"Disney Charactor",
	}

	contains := miscellaneous.Contains[string]

	return miscellaneous.CastBoolToInt(contains(p.StyleName, style[:]))
}

func (p *photomakerParameters) validateInferenceSteps() int8 {
	inRange := miscellaneous.InRange[int8]
	return miscellaneous.CastBoolToInt(inRange(
		p.NumSteps,
		0,
		100,
		true,
		true))
}

func (p *photomakerParameters) validateStyleStrength() int8 {
	inRange := miscellaneous.InRange[int8]
	return miscellaneous.CastBoolToInt(inRange(
		p.StyleStrengthRatio,
		15,
		50,
		true,
		true))
}

func (p *photomakerParameters) validateGuidanceScale() int8 {
	inRange := miscellaneous.InRange[int8]
	return miscellaneous.CastBoolToInt(inRange(
		p.GuidanceScale,
		1,
		10,
		true,
		true))
}

func (p *photomakerParameters) validateSeed() int8 {

	if p.Seed == nil {
		return 1
	}

	inRange := miscellaneous.InRange[int32]
	return miscellaneous.CastBoolToInt(inRange(
		*p.Seed,
		0,
		2147483647,
		true,
		true))
}

func (p *photomakerParameters) PostBodyText() map[string]interface{} {
	validationArr := [5]int8{
		p.validateInferenceSteps(),
		p.validateStyleStrength(),
		p.validateGuidanceScale(),
		p.validateSeed(),
		p.validateStyle(),
	}

	sum := miscellaneous.Sum[int8]

	if sum(validationArr[:]) != 5 {
		return nil
	} else {

		err, url := cloud.GetPresignedURL(p.InputImage)

		if err != nil {
			return nil
		}

		postMap := map[string]interface{}{
			"header": map[string]interface{}{
				"Content-Type":  "application/json",
				"Accept":        "application/json",
				"Authorization": "Bearer ",
			},
			"body": map[string]interface{}{
				"version": os.Getenv("PHOTOMAKER"),
				"input": map[string]interface{}{
					"prompt":                 p.Prompt,
					"negative_prompt":        p.NegativePrompt,
					"num_outputs":            1,
					"guidance_scale":         p.GuidanceScale,
					"disable_safety_checker": p.DisableSafetyChecker,
					"num_steps":              p.NumSteps,
					"input_image":            url,
					"style_strength_ratio":   p.StyleStrengthRatio,
					"style_name":             p.StyleName,
				},
			},
		}

		if p.Seed != nil {
			postMap = setInnerMapValue(postMap, "seed", *p.Seed)
		}

		inputMap := map[string]*string{
			"input_image2": p.InputImage2,
			"input_image3": p.InputImage3,
			"input_image4": p.InputImage4,
		}

		for k, v := range inputMap {
			if v != nil {
				err, url = cloud.GetPresignedURL(p.InputImage)
				if err != nil {
					return nil
				}
				postMap = setInnerMapValue(postMap, k, url)
			}
		}

		return postMap
	}
}

func PhotoMaker(c *gin.Context) {
	var body photomakerParameters
	var err error

	if err = c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	postMap := body.PostBodyText()

	if postMap == nil {
		c.String(http.StatusBadRequest, "invalid body")
		return
	}

	postBody, _ := postMap["body"].(map[string]interface{})

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
		"ImageToImage",
		"replicate/tencentarc/photomaker",
		&responseSuccess{}); ero != nil {

		c.String(http.StatusBadRequest, ero.Error())
		return

	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}
}
