package models

import "time"

type User struct {
	Username   string    `bson:"username, omitempty"`
	Email      string    `bson:"_id, omitempty"`
	Password   string    `bson:"password, omitempty"`
	TokenCount int64     `bson:"token_count, minsize"`
	Verified   bool      `bson:"verified"`
	CreatedAt  time.Time `bson:"created_at"`
	UpdatedAt  time.Time `bson:"updated_at"`
}
