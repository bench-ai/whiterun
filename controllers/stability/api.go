package stability

import (
	"ApiExecutor/miscellaneous"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
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
	case "SD_v1.6":
		betaEng := sd{
			sdEngine: stableEngine,
		}
		eng = &betaEng
	}

	return eng
}

func (tti textToImage) validate() (bool, string) {

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

	if !contains(strings.ToUpper(tti.ClipGuidancePreset), clipGuidancePreset) {
		return false, "clip guidance preset not present"
	}

	if !contains(strings.ToUpper(tti.Sampler), sampler) {
		return false, "sampler not present"
	}

	if !contains(strings.ToLower(tti.StylePreset), stylePreset) {
		return false, "style preset not present"
	}

	if success, message := tti.getEngine().ParametersValid(); !success {
		return false, message
	}

	if tti.CfgScale > 35 {
		return false, "scale is between 0 and 35"
	}

	if tti.Seed > 4294967295 {
		return false, "seed is between 0 and 4294967295"
	}

	return true, "success"
}

func TextToImage(c *gin.Context) {
	var body textToImage

	if err := c.Bind(&body); err != nil {
		fmt.Println(err)
		c.String(http.StatusBadRequest, "Failed to read body")
		return
	}

	fmt.Println(body.EngineId,
		body.Height,
		body.StylePreset,
		body.Width,
		body.Seed,
		body.CfgScale,
		body.Sampler,
		body.TextPrompts,
		body.Steps)

	if status, message := body.validate(); status {
		c.String(http.StatusOK, "success")
		return
	} else {
		c.String(http.StatusNotAcceptable, message)
		return
	}
}
