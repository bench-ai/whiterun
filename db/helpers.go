package db

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UpdateBuilder struct {
	query bson.D
}

func (ub *UpdateBuilder) BuildRequest(operator string, field bson.E) *UpdateBuilder {
	for _, v := range ub.query {
		if v.Key == operator {
			if value, ok := v.Value.(bson.D); ok {
				value = append(value, field)
				return ub
			}
		}
	}

	ub.query = append(ub.query, bson.E{Key: operator, Value: bson.D{field}})

	fmt.Println(ub.query)

	return ub
}

func (ub *UpdateBuilder) ExecuteUpdate(collection *mongo.Collection, filter bson.D) (*mongo.UpdateResult, error) {
	fmt.Println(ub.query)
	fmt.Println(bson.D{{"$set", bson.D{{"work_flows", 4.4}}}})
	fmt.Println(filter)
	data, err := collection.UpdateOne(context.TODO(), filter, ub.query)

	fmt.Println(data)
	return data, err
}

func NewUpdateBuilder() UpdateBuilder {
	return UpdateBuilder{
		bson.D{},
	}
}
