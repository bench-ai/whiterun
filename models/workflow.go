package models

import "time"

type Workflow struct {
	Id          string                 `bson:"_id, omitempty" json:"id,omitempty"`
	OwnersEmail string                 `bson:"owners_email, omitempty" json:"owners_email,omitempty"`
	Name        string                 `bson:"name, omitempty" json:"name,omitempty"`
	CreatedAt   time.Time              `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time              `bson:"updated_at" json:"updated_at"`
	Structure   map[string]interface{} `bson:"structure" json:"structure"`
}
