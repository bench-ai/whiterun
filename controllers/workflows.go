package controllers

import (
	"ApiExecutor/db"
	"ApiExecutor/middleware"
	"ApiExecutor/models"
	"context"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
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

func SaveWorkflow(c *gin.Context) {

	var body struct {
		Structure map[string]interface{}
		Id        string
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

	pUserModel := user.GetUser()

	if _, has := pUserModel.WorkFlows[body.Id]; !has {
		c.String(http.StatusNotFound, "workflow does not exist")
	}

	builder := db.NewUpdateBuilder()

	operator := "$set"

	element := bson.E{
		Key: "structure", Value: body.Structure,
	}

	builder.BuildRequest(operator, element).BuildRequest("$currentDate", bson.E{Key: "updated_at", Value: true})

	filter := bson.D{
		{"_id", body.Id},
	}

	client, err := db.GetDatabaseClient()

	if err != nil {
		panic(err)
	}

	workFlowsCollection := client.Collection("workflow")

	_, err = builder.ExecuteUpdate(workFlowsCollection, filter)

	if err != nil {
		c.String(http.StatusInternalServerError, "could not save workflow")
	} else {
		c.String(http.StatusOK, "workflow has been saved")
	}
}

func GetWorkFlow(c *gin.Context) {
	id := c.Query("id")

	fmt.Println("here")

	client, err := db.GetDatabaseClient()

	if err != nil {
		panic(err)
	}

	var pUser *middleware.JwtToken
	var valid bool

	if attr, ok := c.Get("accessToken"); ok {
		pUser, valid = attr.(*middleware.JwtToken)
		if !valid {
			panic("user is not of type token")
		}
	}

	workFlowsCollection := client.Collection("workflow")
	filter := bson.D{{"_id", id}}

	var result models.Workflow
	err = workFlowsCollection.FindOne(context.TODO(), filter).Decode(&result)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.String(http.StatusNotFound, "workflow not found")
		} else {
			c.String(http.StatusInternalServerError, "could not get workflow")
		}
	} else {
		if result.IsUniversal {
			c.JSON(http.StatusOK, result)
			return
		} else if pUser != nil {
			if result.OwnersEmail == pUser.Email {
				c.JSON(http.StatusOK, result)
				return
			}
		}
		c.String(http.StatusNotFound, "workflow not found")
	}
}
