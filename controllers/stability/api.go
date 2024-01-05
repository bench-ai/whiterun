package stability

import (
	"ApiExecutor/controllers"
	"ApiExecutor/middleware"
	"ApiExecutor/miscellaneous"
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type engine interface {
	ParametersValid() (bool, string)
}

type sdEngine struct {
	Height uint16
	Width  uint16
}

func (engine sdEngine) ParametersValid() (bool, string) {
	return true, "success"
}

func urlBuilder(class string, action string, version string, engineId string) string {
	return fmt.Sprintf("https://api.stability.ai/%s/%s/%s/%s", version, class, engineId, action)
}

type sdxlBeta struct {
	/*
		Works for stable diffusion SDXL beta
	*/
	sdEngine
}

type sdxl struct {
	/*
		Works for stable diffusion SDXL 0.9 and 1.0
	*/
	sdEngine
}

type sd struct {
	/*
		Works for stable diffusion 1.6
	*/
	sdEngine
}

func (engine sdxlBeta) ParametersValid() (bool, string) {
	if (engine.Height < 128) || (engine.Width < 128) {
		return false, "height & width must be greater than 128"
	}
	if (engine.Height > 512) && (engine.Width > 512) {
		return false, "height & width cannot both be greater than 512"
	}
	hw := []uint16{
		engine.Height,
		engine.Width,
	}

	max := miscellaneous.Max[uint16]

	if max(hw) > 896 {
		return false, "Height or width cannot be greater than 896"
	}

	return true, "success"
}

func (engine sdxl) ParametersValid() (bool, string) {
	twentyFour := [][]uint16{
		{1024, 1024},
		{1152, 896},
		{1216, 832},
		{1344, 768},
		{1536, 640},
		{640, 1536},
		{768, 1344},
		{832, 1216},
		{896, 1152},
	}

	hw := []uint16{
		engine.Height,
		engine.Width,
	}

	isEqual := miscellaneous.SlicesAreEquals[uint16]

	for _, value := range twentyFour {
		if isEqual(value, hw) {
			return true, "success"
		}
	}

	return false, fmt.Sprintf("%d x %d are not valid dimensions", engine.Height, engine.Width)
}

func (engine sd) ParametersValid() (bool, string) {

	if (320 > engine.Width) || (320 > engine.Height) {
		return false, "Width and Height have to be greater than 320"
	} else if (1536 < engine.Width) || (1536 < engine.Height) {
		return false, "Width and Height have to be less than 1536"
	}

	return true, "success"
}

type textToImage struct {
	EngineId           string                   `json:"engine_id,omitempty"`
	Width              uint16                   `json:"width,omitempty"`
	Height             uint16                   `json:"height,omitempty"`
	TextPrompts        []map[string]interface{} `json:"text_prompts,omitempty"`
	CfgScale           uint8                    `json:"cfg_scale,omitempty"`
	ClipGuidancePreset string                   `json:"clip_guidance_preset,omitempty"`
	Sampler            string                   `json:"sampler,omitempty"`
	Seed               uint64                   `json:"seed,omitempty"`
	Steps              uint8                    `json:"steps,omitempty"`
	StylePreset        string                   `json:"style_preset,omitempty"`
}

type imageToImage struct {
	EngineId           string                   `json:"engine_id,omitempty"`
	TextPrompts        []map[string]interface{} `json:"text_prompts,omitempty"`
	InitImageMode      string                   `form:"init_image_mode,omitempty"`
	ImageStrength      float32                  `form:"image_strength,omitempty"`
	CfgScale           uint8                    `json:"cfg_scale,omitempty"`
	ClipGuidancePreset string                   `json:"clip_guidance_preset,omitempty"`
	Sampler            string                   `json:"sampler,omitempty"`
	Seed               uint64                   `json:"seed,omitempty"`
	Steps              uint8                    `json:"steps,omitempty"`
	StylePreset        string                   `json:"style_preset,omitempty"`
}

func (iti imageToImage) validate() (bool, string) {

	validPresets, msg := validateOptions(iti.ClipGuidancePreset, iti.Sampler, iti.StylePreset)

	if !validPresets {
		return validPresets, msg
	}

	if success, message := validateNumericScale(iti.CfgScale, iti.Seed, iti.Steps); !success {
		return false, message
	}

	return true, ""

}

func (tti textToImage) getEngine() engine {
	var eng engine

	stableEngine := sdEngine{
		Height: tti.Height,
		Width:  tti.Width,
	}

	switch tti.EngineId {

	case "SDXL_Beta":
		betaEng := sdxlBeta{
			sdEngine: stableEngine,
		}
		eng = &betaEng
	case "SDXL_v0.9", "SDXL_v1.0":
		betaEng := sdxl{
			sdEngine: stableEngine,
		}
		eng = &betaEng
	case "SD_v1.6", "SD_v2.1":
		betaEng := sd{
			sdEngine: stableEngine,
		}
		eng = &betaEng
	default:
		eng = nil
	}

	return eng
}

func validateOptions(clipGuidance, samplerPreset, style string) (bool, string) {
	clipGuidancePreset := []string{
		"FAST_BLUE",
		"FAST_GREEN",
		"NONE",
		"SIMPLE",
		"SLOW",
		"SLOWER",
		"SLOWEST",
	}

	sampler := []string{
		"DDIM",
		"DDPM",
		"K_DPMPP_2M",
		"K_DPMPP_2S_ANCESTRAL",
		"K_DPM_2",
		"K_DPM_2_ANCESTRAL",
		"K_EULER",
		"K_EULER_ANCESTRAL",
		"K_HEUN",
		"K_LMS",
	}

	stylePreset := []string{
		"3d-model",
		"analog-film",
		"anime",
		"cinematic",
		"comic-book",
		"digital-art",
		"enhance",
		"fantasy-art",
		"isometric",
		"line-art",
		"low-poly",
		"modeling-compound",
		"neon-punk",
		"origami",
		"photographic",
		"pixel-art",
		"tile-texture",
	}

	contains := miscellaneous.Contains[string]

	if !contains(strings.ToUpper(clipGuidance), clipGuidancePreset) {
		return false, "clip guidance preset not present"
	}

	if !contains(strings.ToUpper(samplerPreset), sampler) {
		return false, "sampler not present"
	}

	if !contains(strings.ToLower(style), stylePreset) {
		return false, "style preset not present"
	}

	return true, ""
}

func validateNumericScale(cfg uint8, seed uint64, steps uint8) (bool, string) {
	if cfg > 35 {
		return false, "scale is between 0 and 35"
	}

	if seed > 4294967295 {
		return false, "seed is between 0 and 4294967295"
	}

	if (steps < 10) || (steps > 50) {
		return false, "seed is between 0 and 4294967295"
	}

	return true, ""
}

func (tti textToImage) validate() (bool, string) {

	validPresets, msg := validateOptions(tti.ClipGuidancePreset, tti.Sampler, tti.StylePreset)

	if !validPresets {
		return validPresets, msg
	}

	if eng := tti.getEngine(); eng != nil {
		if success, message := eng.ParametersValid(); !success {
			return false, message
		}
	}

	if success, message := validateNumericScale(tti.CfgScale, tti.Seed, tti.Steps); !success {
		return false, message
	}

	return true, "success"
}

func TextToImage(c *gin.Context) {
	var body textToImage

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	engineIdMap := map[string]string{
		"SDXL_Beta": "stable-diffusion-xl-beta-v2-2-2",
		"SDXL_v0.9": "stable-diffusion-xl-1024-v0-9",
		"SDXL_v1.0": "stable-diffusion-xl-1024-v1-0",
		"SD_v1.6":   "stable-diffusion-v1-6",
		"SD_v2.1":   "stable-diffusion-512-v2-1",
	}

	engineId := engineIdMap[body.EngineId]

	url := urlBuilder("generation", "text-to-image", "v1", engineId)

	postMap := map[string]interface{}{
		"width":                body.Width,
		"height":               body.Height,
		"text_prompts":         body.TextPrompts,
		"cfg_scale":            body.CfgScale,
		"clip_guidance_preset": body.ClipGuidancePreset,
		"sampler":              body.Sampler,
		"seed":                 body.Seed,
		"style":                body.StylePreset,
		"steps":                body.Steps,
		"samples":              1,
	}

	if status, message := body.validate(); !status {
		c.String(http.StatusBadRequest, message)
		return
	}

	postBody, err := json.Marshal(postMap)

	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	responseBody := bytes.NewBuffer(postBody)
	newReq, _ := http.NewRequest("POST", url, responseBody)
	apiKey := os.Getenv("STABILITY_AI_KEY")

	newReq.Header.Add("Content-Type", "application/json")
	newReq.Header.Add("Accept", "application/json")
	newReq.Header.Add("Authorization", "Bearer "+apiKey)

	channel := make(chan *http.Response)

	startTime := time.Now().Unix()

	go func() {
		pResponse, er := http.DefaultClient.Do(newReq)
		if er != nil {
			c.String(http.StatusBadRequest, er.Error())
			channel <- nil
		}
		channel <- pResponse
	}()

	pResponse := <-channel
	endTime := time.Now().Unix() - startTime

	if attr, ok := c.Get("accessToken"); ok {
		user, valid := attr.(*middleware.JwtToken)

		if !valid {
			panic("user is not of type token")
		}

		err = LogApiRequest(user.Email, "stability.ai:text-to-image", uint16(endTime), postMap, "")

		if err != nil {
			log.Fatal("unable to log request")
		}
	}

	if pResponse != nil {
		controllers.CopyResponse(c.Writer, pResponse)
	} else {
		return
	}
}

func ImageToImage(c *gin.Context) {
	var body imageToImage

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	engineIdMap := map[string]string{
		"SDXL_Beta": "stable-diffusion-xl-beta-v2-2-2",
		"SDXL_v0.9": "stable-diffusion-xl-1024-v0-9",
		"SDXL_v1.0": "stable-diffusion-xl-1024-v1-0",
		"SD_v1.6":   "stable-diffusion-v1-6",
		"SD_v2.1":   "stable-diffusion-512-v2-1",
	}

	engineId := engineIdMap[body.EngineId]

	url := urlBuilder("generation", "image-to-image", "v1", engineId)

	if err := c.ShouldBindWith(&body, binding.FormMultipart); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	fmt.Println(url, body)

	c.String(http.StatusOK, "success")
	return
}
