package controllers

import (
	"ApiExecutor/db"
	"ApiExecutor/middleware"
	"ApiExecutor/models"
	"context"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"net/http"
	"time"
)

func CreateWorkflow(c *gin.Context) {

	var body struct {
		Name string
	}

	if c.Bind(&body) != nil {
		c.String(http.StatusBadRequest, "Failed to read body")
		return
	}

	var user *middleware.JwtToken
	attr, ok := c.Get("accessToken")

	if ok {
		user, ok = attr.(*middleware.JwtToken)

		if !ok {
			panic("user is not of type token")
		}
	} else {
		panic("attribute does not exist")
	}

	workflowUUID, err := uuid.NewUUID()

	if err != nil {
		panic(err)
	}

	workflowUUIDString := workflowUUID.String()

	pUserModel := user.GetUser()

	if pUserModel == nil {
		{
			panic("access key exists but user model does not")
		}
	}

	er, operator, element := pUserModel.UpdateWorkFlows(workflowUUIDString, body.Name)

	if er != nil {
		c.String(http.StatusBadRequest, er.Error())
		return
	}

	now := time.Now()

	wf := models.Workflow{
		Id:          workflowUUIDString,
		OwnersEmail: pUserModel.Email,
		Name:        body.Name,
		CreatedAt:   now,
		UpdatedAt:   now,
		Structure:   nil,
	}

	builder := db.NewUpdateBuilder()

	builder.BuildRequest(operator, element).BuildRequest("$currentDate", bson.E{Key: "updated_at", Value: true})

	client, err := db.GetDatabaseClient()

	if err != nil {
		panic(err)
	}

	workFlowsCollection := client.Collection("workflow")
	userCollection := client.Collection("user")

	channel := make(chan error)

	go func() {
		_, err = workFlowsCollection.InsertOne(context.TODO(), wf)
		channel <- err
	}()

	go func() {
		_, err = builder.ExecuteUpdate(userCollection, bson.D{{"_id", pUserModel.Email}})
		channel <- err
	}()

	for i := 0; i < 2; i++ {
		er = <-channel
		if er != nil {
			c.String(http.StatusBadRequest, er.Error())
			return
		}
	}

	c.JSON(http.StatusOK, &wf)
}

//func SaveWorkflow(c *gin.Context) {
//
//	var body struct {
//		Name string
//	}
//
//}
