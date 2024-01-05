package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http"
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

	accessString, err := c.Cookie("access")

	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	token := checkValidToken(accessString)

	if token == nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	c.Set("accessToken", token)

	c.Next()
}
