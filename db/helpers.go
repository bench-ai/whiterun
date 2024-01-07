package db

import (
	"context"
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

	return ub
}

func (ub *UpdateBuilder) ExecuteUpdate(collection *mongo.Collection, filter bson.D) (*mongo.UpdateResult, error) {
	data, err := collection.UpdateOne(context.TODO(), filter, ub.query)

	return data, err
}

func NewUpdateBuilder() UpdateBuilder {
	return UpdateBuilder{
		bson.D{},
	}
}
