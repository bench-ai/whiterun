package stability

import (
	"ApiExecutor/cloud"
	"ApiExecutor/controllers"
	"ApiExecutor/miscellaneous"
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"strconv"
	"strings"
)

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
		return false, "steps are between 10 and 50"
	}

	return true, ""
}

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

	maxx := miscellaneous.Max[uint16]

	if maxx(hw) > 896 {
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

type prompt struct {
	Text   string   `json:"text"`
	Weight *float32 `json:"weight,omitempty"`
}

type apiParameters struct {
	EngineId           string   `json:"engine_id"`
	Width              uint16   `json:"width"`
	Height             uint16   `json:"height"`
	TextPrompts        []prompt `json:"text_prompts"`
	CfgScale           uint8    `json:"cfg_scale"`
	ClipGuidancePreset string   `json:"clip_guidance_preset"`
	Sampler            string   `json:"sampler"`
	Seed               uint64   `json:"seed"`
	Steps              uint8    `json:"steps"`
	StylePreset        string   `json:"style_preset"`
	InitImageMode      string   `json:"init_image_mode"`
	ImageStrength      float32  `json:"image_strength"`
	InitImage          string   `json:"init_image"`
	StepScheduleStart  float32  `json:"step_schedule_start"`
	StepScheduleEnd    float32  `json:"step_schedule_end"`
	Image              string   `json:"image"`
	MaskSource         string   `json:"mask_source"`
	MaskImage          string   `json:"mask_image"`
}

func (tti apiParameters) getEngine() engine {
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

func (tti apiParameters) urlBuilder(class string, action string, version string) string {

	engineIdMap := map[string]string{
		"SDXL_Beta": "stable-diffusion-xl-beta-v2-2-2",
		"SDXL_v0.9": "stable-diffusion-xl-1024-v0-9",
		"SDXL_v1.0": "stable-diffusion-xl-1024-v1-0",
		"SD_v1.6":   "stable-diffusion-v1-6",
		"SD_v2.1":   "stable-diffusion-512-v2-1",
	}

	engineId := engineIdMap[tti.EngineId]

	if engineId == "" {
		return ""
	}

	return fmt.Sprintf("https://api.stability.ai/%s/%s/%s/%s", version, class, engineId, action)
}

func (tti apiParameters) validate(validator func(parameters *apiParameters) (bool, string)) (bool, string) {
	return validator(&tti)
}

func textToImageValidator(tti *apiParameters) (bool, string) {
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

func imageToImageMaskingValidator(tti *apiParameters) (bool, string) {

	validPresets, msg := validateOptions(tti.ClipGuidancePreset, tti.Sampler, tti.StylePreset)

	if !validPresets {
		return validPresets, msg
	}

	if success, message := validateNumericScale(tti.CfgScale, tti.Seed, tti.Steps); !success {
		return false, message
	}

	maskSet := map[string]struct{}{
		"MASK_IMAGE_WHITE": {},
		"MASK_IMAGE_BLACK": {},
	}

	if _, v := maskSet[tti.MaskSource]; !v {
		return false, "invalid mask source options are MASK_IMAGE_WHITE & MASK_IMAGE_BLACK"
	}

	return true, ""
}

func imageToImageValidator(iti *apiParameters) (bool, string) {

	between0to1 := func(property float32, name string) (bool, string) {
		if property > 1 {
			return false, fmt.Sprintf("%s must be less than or equal to 1", name)
		} else if property < 0 {
			return false, fmt.Sprintf("%s must be greater than or equal to 0", name)
		} else {
			return true, ""
		}
	}

	validPresets, msg := validateOptions(iti.ClipGuidancePreset, iti.Sampler, iti.StylePreset)

	if !validPresets {
		return validPresets, msg
	}

	if success, message := validateNumericScale(iti.CfgScale, iti.Seed, iti.Steps); !success {
		return false, message
	}

	set := map[string]struct{}{
		"IMAGE_STRENGTH": {},
		"STEP_SCHEDULE":  {},
	}

	_, exists := set[strings.ToUpper(iti.InitImageMode)]

	if !exists {
		return false, "The only allowed Image Modes are STEP_SCHEDULE & IMAGE_STRENGTH"
	}

	if strings.ToUpper(iti.InitImageMode) == "IMAGE_STRENGTH" {

		if status, msgg := between0to1(iti.ImageStrength, "IMAGE_STRENGTH"); !status {
			return status, msgg
		}
	} else {
		if status, msgg := between0to1(iti.StepScheduleStart, "step_schedule_start"); !status {
			return status, msgg
		}

		if status, msgg := between0to1(iti.StepScheduleEnd, "step_schedule_end"); !status {
			return status, msgg
		}
	}

	return true, ""
}

func imageToImageUpscaleRealESRGAN(iti *apiParameters) (bool, string) {
	if (iti.Height == 0) || (iti.Width == 0) {
		if !((iti.Height+iti.Width >= 512) || (iti.Height == iti.Width)) {
			return false, "either height or width must be greater than 512"
		} else {
			return true, ""
		}
	} else {
		return false, "only one dimension height or width can be specified"
	}
}

func imageToImageUpscaleLatent(iti *apiParameters) (bool, string) {
	if success, message := validateNumericScale(iti.CfgScale, iti.Seed, iti.Steps); !success {
		return false, message
	}

	return imageToImageUpscaleRealESRGAN(iti)
}

type extendedResponse interface {
	controllers.ResponseStruct
}

type responseSuccess struct{}

func (r *responseSuccess) Success(
	pResponse *http.Response,
	channel chan map[string]string,
	fileName string) {

	channelMap := map[string]string{
		"type":  "upload",
		"url":   "",
		"error": "",
	}

	type image struct {
		Base64       string `json:"base64"`
		Seed         uint32 `json:"seed"`
		FinishReason string `json:"finishReason"`
	}

	var apiResponse struct {
		Images []image `json:"artifacts"`
	}

	if err := json.NewDecoder(pResponse.Body).Decode(&apiResponse); err != nil {
		channelMap["error"] = err.Error()
		channel <- channelMap
		return
	} else {

		if len(apiResponse.Images) == 0 {
			channelMap["error"] = "no image was given"
			channel <- channelMap
			return
		}

		b64 := apiResponse.Images[0].Base64

		er := cloud.UploadToS3fromBase64PNG(b64, fileName)

		if er != nil {
			channelMap["error"] = err.Error()
			channel <- channelMap
			return
		}

		er, s := cloud.GetPresignedURL(fileName)

		if er != nil {
			channelMap["error"] = err.Error()
			channel <- channelMap
			return
		}

		channelMap["url"] = s
		channel <- channelMap
	}
}

func (r *responseSuccess) Failure(response *http.Response) *controllers.Failed {
	var f controllers.Failed

	if err := json.NewDecoder(response.Body).Decode(&f); err != nil {
		return nil
	}

	return &f
}

func TextToImage(c *gin.Context) {
	var body apiParameters

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	url := body.urlBuilder("generation", "text-to-image", "v1")

	if url == "" {
		c.String(http.StatusBadRequest, "improper engine")
		return
	}

	postMap := map[string]interface{}{
		"header": map[string]interface{}{
			"Content-Type":  "application/json",
			"Accept":        "application/json",
			"Authorization": "Bearer ",
		},
		"body": map[string]interface{}{
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
		},
	}

	if status, message := body.validate(textToImageValidator); !status {
		c.String(http.StatusBadRequest, message)
		return
	}

	postBody, err := json.Marshal(postMap["body"])

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

	if ero, urll := controllers.ExecuteImageRequest(
		newReq,
		c,
		postMap,
		"text-to-image",
		"stability.ai",
		&responseSuccess{}); ero != nil {
		c.String(http.StatusBadRequest, ero.Error())
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}
}

func convertJsonPrompt(builder *miscellaneous.MultiPartFormBuilder, prompts []prompt) {

	for i, v := range prompts {

		textString := fmt.Sprintf("text_prompts[%d][text]", i)
		weightString := fmt.Sprintf("text_prompts[%d][weight]", i)

		builder.AddField(textString, v.Text)
		if v.Weight != nil {
			builder.AddField(weightString, fmt.Sprintf("%f", *v.Weight))
		}
	}
}

func ImageToImage(c *gin.Context) {
	var body apiParameters

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if status, message := body.validate(imageToImageValidator); !status {
		c.String(http.StatusBadRequest, message)
		return
	}

	file, err := cloud.DownloadFromS3(body.InitImage)

	if err != nil {
		c.String(http.StatusBadRequest, "supplied image does not exist")
		return
	}

	postMap := map[string]interface{}{
		"body": map[string]interface{}{
			"init_image":           body.InitImage,
			"init_image_mode":      body.InitImageMode,
			"cfg_scale":            body.CfgScale,
			"clip_guidance_preset": body.ClipGuidancePreset,
			"sampler":              body.Sampler,
			"samples":              1,
			"seed":                 body.Seed,
			"steps":                body.Steps,
			"style_preset":         body.StylePreset,
			"text_prompts":         body.TextPrompts,
		},
		"header": map[string]interface{}{
			"Content-Type":  "application/json",
			"Accept":        "application/json",
			"Authorization": "Bearer ",
		},
	}

	formBuilder := miscellaneous.NewMultiPartFormBuilder()
	formBuilder.
		AddFile("init_image", body.InitImage, file).
		AddField("init_image_mode", body.InitImageMode).
		AddField("cfg_scale", strconv.Itoa(int(body.CfgScale))).
		AddField("clip_guidance_preset", body.ClipGuidancePreset).
		AddField("sampler", body.Sampler).
		AddField("samples", "1").
		AddField("seed", strconv.FormatUint(body.Seed, 10)).
		AddField("steps", strconv.Itoa(int(body.Steps))).
		AddField("style_preset", body.StylePreset)

	if body.InitImageMode == "IMAGE_STRENGTH" {
		formBuilder.AddField("image_strength", fmt.Sprintf("%f", body.ImageStrength))
		postMap["image_strength"] = body.ImageStrength

	} else {
		formBuilder.
			AddField("step_schedule_start", fmt.Sprintf("%f", body.StepScheduleStart)).
			AddField("step_schedule_end", fmt.Sprintf("%f", body.StepScheduleEnd))

		postMap["step_schedule_start"] = body.StepScheduleStart
		postMap["step_schedule_end"] = body.StepScheduleEnd
	}

	convertJsonPrompt(&formBuilder, body.TextPrompts)

	form, contentType := formBuilder.Finish()

	if form == nil {
		c.String(http.StatusInternalServerError, "cannot complete request")
		return
	}

	url := body.urlBuilder("generation", "image-to-image", "v1")

	newReq, err := http.NewRequest("POST", url, form)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	apiKey := os.Getenv("STABILITY_AI_KEY")

	newReq.Header.Add("Content-Type", contentType)
	newReq.Header.Add("Accept", "application/json")
	newReq.Header.Add("Authorization", "Bearer "+apiKey)

	defer newReq.Body.Close()

	if ero, urll := controllers.ExecuteImageRequest(
		newReq,
		c,
		postMap,
		"image-to-image",
		"stability.ai",
		&responseSuccess{}); ero != nil {
		c.String(http.StatusBadRequest, ero.Error())
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}
}

func ImageToImageUpscale(c *gin.Context) {
	var body apiParameters

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	engineMap := map[string]string{
		"ESRGAN_V1X2": "esrgan-v1-x2plus",
		"SD_X4_LU":    "stable-diffusion-x4-latent-upscaler",
	}

	v, ok := engineMap[body.EngineId]

	if !ok {
		c.String(http.StatusBadRequest, "Engine must be either ESRGAN_V1X2 or SD_X4_LU")
		return
	}

	if body.EngineId == "ESRGAN_V1X2" {
		realEsrganUpscaler(c, &body, v)
	} else {
		latentUpscaler(c, &body, v)
	}
}

func addHeightOrWidth(
	height,
	width uint16,
	formBuilder *miscellaneous.MultiPartFormBuilder) {

	if height > width {
		formBuilder.AddField("height", strconv.Itoa(int(height)))
	} else if width > height {
		formBuilder.AddField("width", strconv.Itoa(int(width)))
	}
}

func realEsrganUpscaler(c *gin.Context, body *apiParameters, engineId string) {

	file, err := cloud.DownloadFromS3(body.Image)

	if err != nil {
		c.String(http.StatusBadRequest, "supplied image does not exist")
		return
	}

	if status, message := body.validate(imageToImageUpscaleRealESRGAN); !status {
		c.String(http.StatusBadRequest, message)
		return
	}

	formBuilder := miscellaneous.NewMultiPartFormBuilder()

	postMap := map[string]interface{}{
		"body": map[string]interface{}{
			"image":  body.Image,
			"Height": body.Height,
			"Width":  body.Width,
		},
		"header": map[string]interface{}{
			"Content-Type":  "application/json",
			"Accept":        "application/json",
			"Authorization": "Bearer ",
		},
	}

	addHeightOrWidth(body.Height, body.Width, &formBuilder)
	formBuilder.AddFile("image", body.Image, file)
	form, contentType := formBuilder.Finish()

	if form == nil {
		c.String(http.StatusInternalServerError, "cannot complete request")
		return
	}

	url := fmt.Sprintf(
		"https://api.stability.ai/%s/%s/%s/%s",
		"v1",
		"generation",
		engineId,
		"image-to-image/upscale")

	newReq, err := http.NewRequest("POST", url, form)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	apiKey := os.Getenv("STABILITY_AI_KEY")

	newReq.Header.Add("Content-Type", contentType)
	newReq.Header.Add("Accept", "application/json")
	newReq.Header.Add("Authorization", "Bearer "+apiKey)

	defer newReq.Body.Close()

	if ero, urll := controllers.ExecuteImageRequest(
		newReq,
		c,
		postMap,
		"image-to-image/upscale/ESRGAN",
		"stability.ai",
		&responseSuccess{}); ero != nil {
		c.String(http.StatusBadRequest, ero.Error())
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}
}

func latentUpscaler(c *gin.Context, body *apiParameters, engineId string) {

	file, err := cloud.DownloadFromS3(body.Image)

	if err != nil {
		c.String(http.StatusBadRequest, "supplied image does not exist")
		return
	}

	if status, message := body.validate(imageToImageUpscaleLatent); !status {
		c.String(http.StatusBadRequest, message)
		return
	}

	formBuilder := miscellaneous.NewMultiPartFormBuilder()

	postMap := map[string]interface{}{
		"body": map[string]interface{}{
			"image":        body.Image,
			"height":       body.Height,
			"width":        body.Width,
			"seed":         body.Seed,
			"steps":        body.Steps,
			"cfg_scale":    body.CfgScale,
			"text_prompts": body.TextPrompts,
		},
		"header": map[string]interface{}{
			"Content-Type":  "application/json",
			"Accept":        "application/json",
			"Authorization": "Bearer ",
		},
	}

	addHeightOrWidth(body.Height, body.Width, &formBuilder)
	formBuilder.
		AddFile("image", body.Image, file).
		AddField("seed", strconv.FormatUint(body.Seed, 10)).
		AddField("steps", strconv.Itoa(int(body.Steps))).
		AddField("cfg_scale", strconv.Itoa(int(body.CfgScale)))

	convertJsonPrompt(&formBuilder, body.TextPrompts)

	form, contentType := formBuilder.Finish()

	if form == nil {
		c.String(http.StatusInternalServerError, "cannot complete request")
		return
	}

	url := fmt.Sprintf(
		"https://api.stability.ai/%s/%s/%s/%s",
		"v1",
		"generation",
		engineId,
		"image-to-image/upscale")

	newReq, err := http.NewRequest("POST", url, form)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	apiKey := os.Getenv("STABILITY_AI_KEY")

	newReq.Header.Add("Content-Type", contentType)
	newReq.Header.Add("Accept", "application/json")
	newReq.Header.Add("Authorization", "Bearer "+apiKey)

	defer newReq.Body.Close()

	if ero, urll := controllers.ExecuteImageRequest(
		newReq,
		c,
		postMap,
		"image-to-image/upscale/LATENT",
		"stability.ai",
		&responseSuccess{}); ero != nil {
		c.String(http.StatusBadRequest, ero.Error())
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}
}

func ImageToImageMask(c *gin.Context) {
	var body apiParameters

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if status, message := body.validate(imageToImageMaskingValidator); !status {
		c.String(http.StatusBadRequest, message)
		return
	}

	type tempChan struct {
		bytes  []byte
		err    error
		isMask bool
	}

	channel := make(chan tempChan)

	fileGetter := func(imageKey string, ch chan tempChan, isMask bool) {

		file, err := cloud.DownloadFromS3(imageKey)
		ch <- tempChan{
			file,
			err,
			isMask,
		}

	}

	go fileGetter(body.InitImage, channel, false)
	go fileGetter(body.MaskImage, channel, true)

	postMap := map[string]interface{}{
		"body": map[string]interface{}{
			"init_image":           body.InitImage,
			"mask_image":           body.MaskImage,
			"cfg_scale":            body.CfgScale,
			"clip_guidance_preset": body.ClipGuidancePreset,
			"sampler":              body.Sampler,
			"samples":              1,
			"seed":                 body.Seed,
			"steps":                body.Steps,
			"style_preset":         body.StylePreset,
			"text_prompts":         body.TextPrompts,
			"mask_source":          body.MaskSource,
		},
		"header": map[string]interface{}{
			"Content-Type":  "application/json",
			"Accept":        "application/json",
			"Authorization": "Bearer ",
		},
	}

	formBuilder := miscellaneous.NewMultiPartFormBuilder()
	formBuilder.
		AddField("mask_source", body.MaskSource).
		AddField("cfg_scale", strconv.Itoa(int(body.CfgScale))).
		AddField("clip_guidance_preset", body.ClipGuidancePreset).
		AddField("sampler", body.Sampler).
		AddField("samples", "1").
		AddField("seed", strconv.FormatUint(body.Seed, 10)).
		AddField("steps", strconv.Itoa(int(body.Steps))).
		AddField("style_preset", body.StylePreset)

	convertJsonPrompt(&formBuilder, body.TextPrompts)

	fileOne := <-channel
	fileTwo := <-channel

	if (fileOne.err != nil) || (fileTwo.err != nil) {
		c.String(http.StatusInternalServerError, "could not get requested image files")
	}

	if fileOne.isMask {
		formBuilder.AddFile("mask_image", body.MaskImage, fileOne.bytes)
		formBuilder.AddFile("init_image", body.InitImage, fileTwo.bytes)
	} else {
		formBuilder.AddFile("mask_image", body.MaskImage, fileTwo.bytes)
		formBuilder.AddFile("init_image", body.InitImage, fileOne.bytes)
	}

	form, contentType := formBuilder.Finish()

	if form == nil {
		c.String(http.StatusInternalServerError, "cannot complete request")
		return
	}

	url := body.urlBuilder("generation", "image-to-image/masking", "v1")

	newReq, err := http.NewRequest("POST", url, form)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	apiKey := os.Getenv("STABILITY_AI_KEY")

	newReq.Header.Add("Content-Type", contentType)
	newReq.Header.Add("Accept", "application/json")
	newReq.Header.Add("Authorization", "Bearer "+apiKey)

	defer newReq.Body.Close()

	if ero, urll := controllers.ExecuteImageRequest(
		newReq,
		c,
		postMap,
		"image-to-image/masking",
		"stability.ai",
		&responseSuccess{}); ero != nil {
		c.String(http.StatusBadRequest, ero.Error())
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"url": urll})
	}
}
