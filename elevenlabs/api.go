package elevenlabs

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

type settings struct {
	SimilarityBoost int  `json:"similarity_boost"`
	Stability       int  `json:"stability"`
	Style           int  `json:"style"`
	UseSpeakerBoost bool `json:"use_speaker_boost"`
}

type voiceVerification struct {
	IsVerified           bool   `json:"is_verified"`
	Language             string `json:"language"`
	RequiresVerification bool   `json:"requires_verification"`
}

type voice struct {
	AvailableForTiers []string `json:"available_for_tiers"`
	Category          string
	Description       string
	VoiceId           string `json:"voice_id"`
	Labels            interface{}
	Name              string
	Settings          settings
	VoiceVerification voiceVerification `json:"voice_verification"`
}

func collectVoiceList() (int, string) {
	url := "https://api.elevenlabs.io/v1/voices"
	header := os.Getenv("eleven")

	newReq, _ := http.NewRequest("GET", url, nil)

	newReq.Header.Add("Content-Type", "application/json")
	newReq.Header.Add("xi-api-key", header)

	pResponse, er := http.DefaultClient.Do(newReq)

	if er != nil {
		return http.StatusInternalServerError, "unable to process and handle request"
	}

	var body []voice

	if err := json.NewDecoder(pResponse.Body).Decode(&body); err != nil {
		return http.StatusInternalServerError, "unable to process and handle request"
	} else {
		fmt.Println(body)
		return http.StatusOK, "success"
	}
}

func CollectVoiceList(c *gin.Context) {
	status, message := collectVoiceList()

	c.String(status, message)
	return
}
