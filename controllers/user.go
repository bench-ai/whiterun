package controllers

import (
	"ApiExecutor/db"
	"ApiExecutor/middleware"
	"ApiExecutor/models"
	"context"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

func comparePasswords(truth, test string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(truth), []byte(test))
	return err == nil
}

func validatePassword(password string) error {

	letters := "qwertyuiopasdfghjklzxcvbnm"
	numbers := "1234567890"
	//special := "!#$%^&*():.,/?|}{`~"
	special := `!@#$%^&*()_+-=[]{};':"\|,.<>/?`

	var message string

	if len(password) < 10 {
		message += "password is not greater than 10 characters; "
	}

	message += "password does not contain: "

	if !strings.ContainsAny(password, letters) {
		message += "at least one lowercase letter, "
	}

	if !strings.ContainsAny(password, strings.ToUpper(letters)) {
		message += "at least one uppercase letter, "
	}

	if !strings.ContainsAny(password, special) {
		message += "at least one special character, "
	}

	if !strings.ContainsAny(password, numbers) {
		message += "at least one number, "
	}

	if len(message) > len("password is not greater than 10 characters; ") {
		return errors.New(message)
	} else {
		return nil
	}
}

func validateEmail(email string) error {

	email = strings.ToLower(email)

	letters := "qwertyuiopasdfghjklzxcvbnm"

	if !strings.ContainsAny(email, letters) {
		return errors.New("invalid email address")
	}

	if !strings.ContainsAny(email, "@") {
		return errors.New("invalid email address")
	}

	if !strings.ContainsAny(email, ".") {
		return errors.New("invalid email address")
	}

	if len(email) < 6 {
		return errors.New("invalid email address")
	}

	if !strings.ContainsAny(letters, string(email[0])) {
		return errors.New("invalid email address")
	}

	if strings.ContainsAny(email, " ") {
		return errors.New("invalid email address")
	}

	return nil
}

func validateUsername(username string) error {
	letters := "qwertyuiopasdfghjklzxcvbnm"

	username = strings.ToLower(username)

	if !strings.ContainsAny(letters, string(username[0])) {
		return errors.New("username must start with letter")
	}

	if len(username) < 2 {
		return errors.New("username must be greater than 2 characters")
	}

	return nil
}

func Signup(c *gin.Context) {
	var body struct {
		Email    string
		Password string
		Username string
	}

	fmt.Println(body)

	if c.Bind(&body) != nil {
		c.String(http.StatusBadRequest, "Failed to read body")
		return
	}

	if err := validatePassword(body.Password); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if err := validateEmail(body.Email); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	if err := validateUsername(body.Username); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	access, refresh, er, status, user := signup(body.Email, body.Username, body.Password)

	lifetime, err := strconv.Atoi(os.Getenv("LIFETIME"))
	secure, err := strconv.ParseBool(os.Getenv("SECURE"))
	httpOnly, err := strconv.ParseBool(os.Getenv("HTTP_ONLY"))

	if err != nil {
		panic(err)
	}

	if er != nil {
		c.String(status, er.Error())
	} else {
		if os.Getenv("DEV") == "false" {
			c.SetSameSite(http.SameSiteNoneMode)
		}
		c.SetCookie("refresh", refresh, lifetime, "/", os.Getenv("DOMAIN"), secure, httpOnly)
		c.SetCookie("access", access, lifetime, "/", os.Getenv("DOMAIN"), secure, httpOnly)
		c.JSON(http.StatusOK, gin.H{
			"user": user,
		})
	}

}

func signup(email string, username string, password string) (string, string, error, int, *models.User) {

	c := make(chan string)
	var hashError error

	go func() {
		password, hashError = hashPassword(password)
		c <- password
	}()

	client, err := db.GetDatabaseClient()

	fmt.Println(err)

	if err != nil {
		return "", "", err, http.StatusPreconditionFailed, nil
	}

	userCollection := client.Collection("user")

	filter := bson.D{{"_id", email}}
	var user models.User

	err = userCollection.FindOne(context.TODO(), filter).Decode(&user)

	if err != nil {
		if !errors.Is(err, mongo.ErrNoDocuments) {
			return "", "", err, http.StatusInternalServerError, nil
		}
	} else {
		return "", "", errors.New("a user with this email already exists"), http.StatusConflict, nil
	}

	hash := <-c

	if hashError != nil {
		return "", "", hashError, http.StatusInternalServerError, nil
	}

	refreshToken, uid, er := middleware.GenRefreshToken(username)

	if er != nil {
		return "", "", err, http.StatusInternalServerError, nil
	}

	accessToken, er := middleware.GenBasicAccessToken(username, email, uid)

	if er != nil {
		return "", "", err, http.StatusInternalServerError, nil
	}

	now := time.Now()

	newUser := models.User{
		TokenCount: 0,
		Email:      email,
		Username:   username,
		Password:   hash,
		Verified:   false,
		UpdatedAt:  now,
		CreatedAt:  now,
	}

	_, err = userCollection.InsertOne(context.TODO(), newUser)

	fmt.Println(err)

	return accessToken, refreshToken, nil, http.StatusOK, &newUser
}

func Login(c *gin.Context) {
	var body struct {
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.String(http.StatusBadRequest, "Failed to read body")
		return
	}

	access, refresh, er, status, pUser := login(body.Email, body.Password)

	lifetime, err := strconv.Atoi(os.Getenv("LIFETIME"))
	secure, err := strconv.ParseBool(os.Getenv("SECURE"))
	httpOnly, err := strconv.ParseBool(os.Getenv("HTTP_ONLY"))

	if err != nil {
		panic(err)
	}

	if er != nil {
		c.String(status, er.Error())
	} else {
		if os.Getenv("DEV") == "false" {
			c.SetSameSite(http.SameSiteNoneMode)
		}
		c.SetCookie("refresh", refresh, lifetime, "/", os.Getenv("DOMAIN"), secure, httpOnly)
		c.SetCookie("access", access, lifetime, "/", os.Getenv("DOMAIN"), secure, httpOnly)

		c.JSON(http.StatusOK, gin.H{
			"user": pUser,
		})
	}
}

func login(email string, password string) (string, string, error, int, *models.User) {

	standardError := errors.New("either the username or password is invalid")

	client, err := db.GetDatabaseClient()

	if err != nil {
		panic(err)
	}

	userCollection := client.Collection("user")

	filter := bson.D{{"_id", email}}
	var user models.User

	err = userCollection.FindOne(context.TODO(), filter).Decode(&user)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return "", "", standardError, http.StatusNotFound, nil
	} else if err != nil {
		return "", "", errors.New("internal server issues"), http.StatusInternalServerError, nil
	}

	if comparePasswords(user.Password, password) {

		refreshToken, uid, er := middleware.GenRefreshToken(user.Username)

		if er != nil {
			panic(err)
		}

		// if verified give higher access

		accessToken, er := middleware.GenBasicAccessToken(user.Username, email, uid)

		if er != nil {
			panic(err)
		}

		return accessToken, refreshToken, nil, http.StatusOK, &user
	} else {
		return "", "", standardError, http.StatusNotFound, nil
	}
}

func Test(c *gin.Context) {
	var user *middleware.JwtToken
	attr, ok := c.Get("accessToken")

	if ok {
		user, ok = attr.(*middleware.JwtToken)

		if !ok {
			panic("user is not of type token")
		}
	} else {
		panic("attribute does not exist")
	}

	fmt.Println(user.Email)
	fmt.Println(user.IsExpired())
	fmt.Println(user.GetSubject())
	c.String(http.StatusOK, "Success")
}

func refreshTokens(accessString string, refreshString string) (error, string, int) {

	c := make(chan map[string]interface{})

	validateToken := func(tokenString string, name string) {
		sigErr, claimsErr, tkn, val := middleware.ParseToken(tokenString)
		eMap := map[string]interface{}{}

		if sigErr != nil {
			if name == "refresh" {
				eMap["sig"] = false
				fmt.Println(sigErr)
			} else {
				if errors.Is(sigErr, jwt.ErrTokenExpired) {
					eMap["sig"] = true
				} else {
					eMap["sig"] = false
					fmt.Println(sigErr)
				}
			}
		} else {
			eMap["sig"] = true
		}

		if claimsErr != nil {
			fmt.Println(claimsErr)
			eMap["clm"] = false
		} else {
			eMap["clm"] = true
		}

		eMap["tkn"] = tkn
		eMap["val"] = val
		eMap["name"] = name
		c <- eMap
	}

	go validateToken(accessString, "access")
	go validateToken(refreshString, "refresh")

	var accessToken *middleware.JwtToken
	var refreshToken *middleware.JwtToken

	for i := 0; i < 2; i++ {
		dataMap := <-c
		cond1, _ := dataMap["sig"].(bool)
		cond2, _ := dataMap["clm"].(bool)
		jTkn, _ := dataMap["tkn"].(*middleware.JwtToken)
		cond3 := jTkn != nil
		cond4, _ := dataMap["val"].(bool)
		name, _ := dataMap["name"].(string)

		if name == "access" {
			// check that access token's signature and claims are valid
			if !(cond1 && cond2 && cond3) {
				return errors.New("invalid access token"), "", http.StatusUnauthorized
			}
			accessToken = jTkn
		} else {
			// check that refresh token signature and claims are valid and is not expired
			if !(cond1 && cond2 && cond3 && cond4) {
				return errors.New("invalid refresh token"), "", http.StatusUnauthorized
			}
			refreshToken = jTkn
		}
	}

	return refreshToken.RefreshAccess(accessToken)
}

func RefreshToken(c *gin.Context) {

	refreshString, err := c.Cookie("refresh")

	accessString, err := c.Cookie("access")
	//stringArray := strings.Split(accessString, " ")
	//accessString = stringArray[len(stringArray)-1]

	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
	}

	err, newAccessString, status := refreshTokens(accessString, refreshString)

	if err != nil {
		c.String(status, err.Error())
	} else {
		lifetime, err := strconv.Atoi(os.Getenv("LIFETIME"))
		secure, err := strconv.ParseBool(os.Getenv("SECURE"))
		httpOnly, err := strconv.ParseBool(os.Getenv("HTTP_ONLY"))
		if err != nil {
			panic(err)
		}
		if os.Getenv("DEV") == "false" {
			c.SetSameSite(http.SameSiteNoneMode)
		}
		c.SetCookie("access", newAccessString, lifetime, "/", os.Getenv("DOMAIN"), secure, httpOnly)
		//c.JSON(status, gin.H{
		//	"access": newAccessString,
		//})
	}
}

func Logout(c *gin.Context) {

	secure, err := strconv.ParseBool(os.Getenv("SECURE"))
	httpOnly, err := strconv.ParseBool(os.Getenv("HTTP_ONLY"))

	if err != nil {
		panic(err)
	}
	c.SetCookie("refresh", "", -1, "/", os.Getenv("DOMAIN"), secure, httpOnly)
	c.SetCookie("access", "", -1, "/", os.Getenv("DOMAIN"), secure, httpOnly)
	c.String(http.StatusOK, "logged out")
}

func User(c *gin.Context) {
	var user *middleware.JwtToken
	attr, ok := c.Get("accessToken")

	if ok {
		user, ok = attr.(*middleware.JwtToken)

		if !ok {
			panic("user is not of type token")
		}
	} else {
		panic("attribute does not exist")
	}

	pUserModel := user.GetUser()
	if pUserModel != nil {
		c.JSON(http.StatusOK, pUserModel)
	} else {
		panic("access key exists but user model does not")
	}
}
