package models

import "time"

type User struct {
	Username   string    `bson:"username, omitempty" json:"username,omitempty"`
	Email      string    `bson:"_id, omitempty" json:"email,omitempty"`
	Password   string    `bson:"password, omitempty" json:"-"`
	TokenCount int64     `bson:"token_count, minsize" json:"token_count,omitempty"`
	Verified   bool      `bson:"verified" json:"verified"`
	CreatedAt  time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time `bson:"updated_at" json:"updated_at"`
}
