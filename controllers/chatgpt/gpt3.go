package chatgpt

import (
	"ApiExecutor/controllers"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"sort"
)

type extendedResponse interface {
	controllers.ChatResponseStruct
}

type responseSuccess struct{}

func chatgptFailure(response *http.Response) *controllers.Failed {
	var body struct {
		Error struct {
			Message string
			Type    string
			Param   *string
			Code    int
		}
	}

	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		return nil
	}

	return &controllers.Failed{
		Message: body.Error.Message,
		Name:    body.Error.Type,
	}
}

func chatgptSuccess(pResponse *http.Response) []string {

	type choice struct {
		Index        int8
		Message      map[string]string
		FinishReason string `json:"finish_reason"`
	}

	var response struct {
		Id                string
		Object            string
		Created           int64
		Model             string
		SystemFingerprint string `json:"system_fingerprint"`
		Choices           []choice
		Usage             map[string]int32
	}

	if err := json.NewDecoder(pResponse.Body).Decode(&response); err != nil {
		fmt.Println(err)
		return nil
	} else {

		sort.SliceStable(response.Choices, func(i, j int) bool {
			return response.Choices[i].Index < response.Choices[j].Index
		})

		var contentArr []string
		for _, choice := range response.Choices {
			contentArr = append(contentArr, choice.Message["content"])
		}
		return contentArr
	}
}

func (r *responseSuccess) Failure(response *http.Response) *controllers.Failed {
	return chatgptFailure(response)
}

func (r *responseSuccess) Success(pResponse *http.Response) []string {
	return chatgptSuccess(pResponse)
}

func executeChatRequest(
	content []map[string]string,
	temperature float32,
	model string,
	n int8,
	c *gin.Context) {

	body := map[string]interface{}{
		"model":       model,
		"temperature": temperature,
		"n":           n,
		"messages":    content,
	}

	var postBytes []byte
	postBytes, err := json.Marshal(body)

	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
	}

	url := "https://api.openai.com/v1/chat/completions"

	responseBody := bytes.NewBuffer(postBytes)
	newReq, _ := http.NewRequest("POST", url, responseBody)
	apiKey := os.Getenv("OPEN_AI")

	newReq.Header.Add("Content-Type", "application/json")
	newReq.Header.Add("Authorization", "Bearer "+apiKey)

	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	dataArr, err := controllers.ExecuteChatRequest(
		newReq,
		c,
		body,
		"text-completion",
		"openai",
		&responseSuccess{})

	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, dataArr)
	return
}

func Gpt(c *gin.Context) {
	var body struct {
		Content     string
		Temperature float32
	}

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	content := []map[string]string{
		{
			"role":    "user",
			"content": body.Content,
		},
	}

	executeChatRequest(
		content,
		body.Temperature,
		"gpt-3.5-turbo",
		1,
		c)
	return
}

func getStylePrompt(style, prompt string) (string, error) {

	starter := fmt.Sprintf(`This is my prompt: "%s" `, prompt)

	styles := map[string]string{
		"photorealistic": "I need you to make this prompt mode detailed, by adding more detail " +
			"of what is present in this real photo." +
			" Start the sentence with 'An 8k UHD photograph of'",
		"oilpainting": "I need you to make this prompt mode detailed, by adding more detail of what" +
			" is present in this oil painting, while detailing the art style and what it invokes. " +
			"Start the sentence with a 'Highly detailed oil pointing masterpiece of'",
		"anime": "I need you to make this prompt mode detailed, by adding more detail " +
			"of what is present in this anime image." +
			"Start the sentence with 'A highly detailed anime image'",
		"fantasy": "I need you to make this prompt mode detailed, by adding more detail " +
			"of what is present in this fantasy style image." +
			"Start the sentence with 'Highly detailed image in a fantasy style'",
		"neonpunk": "I need you to make this prompt mode detailed, by adding more detail " +
			"of what is present in this neon-punk style image." +
			"Start the sentence with 'Highly detailed neon-punk image'",
	}

	if newPrompt, ok := styles[style]; ok {
		return starter + newPrompt, nil
	} else {
		return "", errors.New("style not present")
	}
}

func PromptGenerator(c *gin.Context) {
	var body struct {
		Content     string
		Temperature float32
		Style       string
	}

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	validPrompt, err := getStylePrompt(body.Style, body.Content)

	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	content := []map[string]string{
		{
			"role":    "system",
			"content": "You are a author who has mastered the art of describing images",
		},
		{
			"role":    "user",
			"content": validPrompt,
		},
	}

	executeChatRequest(
		content,
		body.Temperature,
		"gpt-3.5-turbo",
		5,
		c)
	return
}
