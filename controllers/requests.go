package controllers

import (
	"ApiExecutor/db"
	"ApiExecutor/middleware"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log"
	"net/http"
	"time"
)

type Failed struct {
	Id      string `json:"id"`
	Message string `json:"message"`
	Name    string `json:"name"`
}

type ResponseStruct interface {
	Success(response *http.Response, channel chan map[string]string, fileName string)
	Failure(response *http.Response) *Failed
}

func ExecuteImageRequest(
	pRequest *http.Request,
	c *gin.Context,
	requestMap map[string]interface{},
	requestName string,
	org string,
	responseStruct ResponseStruct) (error, string) {

	startTime := time.Now().Unix()
	pResponse, er := http.DefaultClient.Do(pRequest)
	endTime := time.Now().Unix() - startTime

	defer pResponse.Body.Close()

	if er != nil {
		return er, ""
	}

	if (pResponse.StatusCode != 200) && (pResponse.StatusCode != 201) {

		fmt.Println(pResponse.StatusCode)

		pFailed := responseStruct.Failure(pResponse)

		if pFailed == nil {
			return errors.New("failed to bind error message"), ""
		}

		return errors.New(pFailed.Message), ""
	}

	channel := make(chan map[string]string)

	uuidString := uuid.New().String()
	uuidString += "-bench.png"

	go responseStruct.Success(pResponse, channel, uuidString)

	go func(ch chan map[string]string) {
		if attr, ok := c.Get("accessToken"); ok {
			user, valid := attr.(*middleware.JwtToken)

			if !valid {
				panic("user is not of type token")
			}

			requestMap["response"] = map[string]string{
				"object": uuidString,
			}

			er = db.LogApiRequest(
				user.Email,
				fmt.Sprintf("%s:%s", org, requestName),
				uint16(endTime),
				requestMap,
				"")

			if er != nil {
				log.Fatal("unable to log request")
			}
		}
		ch <- map[string]string{
			"type": "log",
		}
	}(channel)

	channelOut := []map[string]string{
		<-channel,
		<-channel,
	}

	for _, i := range channelOut {
		if i["type"] == "upload" {
			if i["url"] == "" {
				return errors.New(i["error"]), ""
			} else {
				return nil, i["url"]
			}
		}
	}

	return errors.New("failed"), ""
}
