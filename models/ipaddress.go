package models

import "time"

type IpAddress struct {
	IpAddress    string    `bson:"_id, omitempty" json:"ip_address,omitempty"`
	RequestsMade uint8     `bson:"requests_made, omitempty" json:"requests_made,omitempty"`
	UpdatedAt    time.Time `bson:"updated_at" json:"updated_at"`
}
