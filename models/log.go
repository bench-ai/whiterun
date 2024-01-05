package models

import "time"

type Log struct {
	Email       string                 `bson:"email, omitempty" json:"ip_address,omitempty"`
	RequestName string                 `bson:"requests_name, omitempty" json:"requests_name,omitempty"`
	CreatedAt   time.Time              `bson:"created_at" json:"created_at"`
	Duration    uint16                 `bson:"duration" json:"duration"`
	JsonBody    map[string]interface{} `bson:"json_body" json:"json_body"`
	WorkflowId  string                 `bson:"workflow_id" json:"workflow_id"`
}
