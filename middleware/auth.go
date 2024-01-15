package middleware

import (
	"errors"
	"fmt"
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

func CheckExecutionAccess(c *gin.Context) {
	token, err := getAccessToken(c)
	if err != nil {
		ipAddressString := c.ClientIP()
		er, ipAddrPointer := getIpDocument(ipAddressString)

		if er != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		} else {
			fmt.Println(ipAddrPointer.RequestsMade, ipAddrPointer.UpdatedAt)
			c.Next()
		}
	} else {
		c.Set("accessToken", token)
	}
	c.Next()
}

func CheckWorkflowAccess(c *gin.Context) {
	fmt.Println("in workflow access")
	token, err := getAccessToken(c)
	if err == nil {
		c.Set("accessToken", token)
	}
	c.Next()
}

func getAccessToken(c *gin.Context) (*JwtToken, error) {

	accessString, err := c.Cookie("access")
	if err != nil {
		return nil, err
	}

	token := checkValidToken(accessString)
	if token == nil {
		return nil, errors.New("invalid token")
	}

	return token, nil
}

func CheckAccess(c *gin.Context) {

	token, err := getAccessToken(c)
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	c.Set("accessToken", token)
	c.Next()

}
