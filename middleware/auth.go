package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
	"time"
)

func checkValidToken(accessToken string) *JwtToken {

	parseError, claimsError, token, isValid := ParseToken(accessToken)

	if parseError != nil {
		return nil
	}

	if claimsError != nil {
		return nil
	}

	if !isValid {
		return nil
	}

	if token != nil {
		if token.ExpiresAt.Unix() > time.Now().Unix() {
			return token
		} else {
			return nil
		}
	} else {
		return token
	}
}

func CheckAccess(c *gin.Context) {

	accessToken := c.GetHeader("Authorization")
	stringArray := strings.Split(accessToken, " ")
	accessToken = stringArray[len(stringArray)-1]

	token := checkValidToken(accessToken)

	if token == nil {
		c.AbortWithStatus(http.StatusUnauthorized)
	}

	c.Set("accessToken", token)

	c.Next()

}
