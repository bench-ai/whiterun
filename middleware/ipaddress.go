package middleware

import (
	"ApiExecutor/db"
	"ApiExecutor/models"
	"context"
	"errors"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
)

func getIpDocument(ipAddress string) (error, *models.IpAddress) {

	database, err := db.GetDatabaseClient()

	if err != nil {
		panic(err)
	}

	col := database.Collection("ipaddress")

	var ip models.IpAddress

	filter := bson.D{{"_id", ipAddress}}
	err = col.FindOne(context.TODO(), filter).Decode(&ip)

	now := time.Now()

	if err != nil {
		if !errors.Is(err, mongo.ErrNoDocuments) {
			return err, nil
		} else {
			ip = models.IpAddress{
				RequestsMade: 1,
				UpdatedAt:    now,
				IpAddress:    ipAddress,
			}

			_, er := col.InsertOne(context.TODO(), &ip)

			if er != nil {
				return er, nil
			} else {
				return nil, &ip
			}
		}
	} else {
		year, month, day := ip.UpdatedAt.UTC().Date()
		nowYear, nowMonth, nowDay := now.UTC().Date()

		fmt.Println("here", year, month, day)
		fmt.Println("here", nowYear, nowMonth, nowDay)

		cond1 := year == nowYear
		cond2 := month == nowMonth
		cond3 := nowDay == day

		if cond1 && cond2 && cond3 {
			if ip.RequestsMade == 10 {
				return errors.New("reached daily limit"), nil
			} else {
				ip.RequestsMade += 1
			}

			fmt.Println("here 1", ip.RequestsMade)
		} else {
			ip.RequestsMade = 1
			fmt.Println("reset", ip.RequestsMade)
		}

		ip.UpdatedAt = now
		mongoFilter := bson.D{{"_id", ip.IpAddress}}
		update := bson.D{
			{"$set", bson.D{
				{"requests_made", ip.RequestsMade},
				{"updated_at", ip.UpdatedAt}},
			},
		}

		_, er := col.UpdateOne(context.TODO(), mongoFilter, update)

		if er != nil {
			return er, nil
		} else {
			return nil, &ip
		}
	}

}
