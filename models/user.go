package models

import (
	"ApiExecutor/miscellaneous"
	"errors"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"strings"
	"time"
)

type User struct {
	Username   string                            `bson:"username, omitempty" json:"username,omitempty"`
	Email      string                            `bson:"_id, omitempty" json:"email,omitempty"`
	Password   string                            `bson:"password, omitempty" json:"-"`
	TokenCount int64                             `bson:"token_count, minsize" json:"token_count,omitempty"`
	Verified   bool                              `bson:"verified" json:"verified"`
	CreatedAt  time.Time                         `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time                         `bson:"updated_at" json:"updated_at"`
	WorkFlows  map[string]map[string]interface{} `bson:"work_flows" json:"work_flows"`
}

func (u *User) UpdateWorkFlows(workflowId string, name string) (error, string, bson.E) {

	if _, ok := u.WorkFlows[workflowId]; ok {
		return errors.New("id already exists"), "", bson.E{}
	}

	if u.WorkFlows != nil {
		var nameSlice []string

		for _, v := range u.WorkFlows {
			if value, ok := v["name"].(string); ok {
				nameSlice = append(nameSlice, value)
			}
		}

		contains := miscellaneous.Contains[string]
		miscellaneous.LowerSlice(nameSlice)

		if contains(strings.ToLower(name), nameSlice) {
			return errors.New("name is already being used"), "", bson.E{}
		} else {
			u.WorkFlows[workflowId] = map[string]interface{}{
				"name": name,
			}

			return nil, "$set", bson.E{Key: fmt.Sprintf("%s.%s", "work_flows", workflowId), Value: u.WorkFlows[workflowId]}
		}
	} else {

		u.WorkFlows = map[string]map[string]interface{}{
			workflowId: {
				"name": name,
			},
		}

		return nil, "$set", bson.E{Key: "work_flows", Value: u.WorkFlows}
	}
}
