package db

import (
	"ApiExecutor/models"
	"context"
	"time"
)

func LogApiRequest(email string,
	requestName string,
	duration uint16,
	jsonBody map[string]interface{},
	workflowId string) error {

	var log models.Log

	database, err := GetDatabaseClient()

	if err != nil {
		panic(err)
	}

	col := database.Collection("requestlogs")

	log = models.Log{
		Email:       email,
		RequestName: requestName,
		CreatedAt:   time.Now(),
		Duration:    duration,
		JsonBody:    jsonBody,
		WorkflowId:  workflowId,
	}

	_, er := col.InsertOne(context.TODO(), &log)

	return er
}
