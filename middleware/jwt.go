package middleware

import (
	"ApiExecutor/db"
	"ApiExecutor/models"
	"context"
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"net/http"
	"os"
	"time"
)

type JwtToken struct {
	jwt.RegisteredClaims
	TryApps       bool   `json:"try_apps"`
	Verified      bool   `json:"verified"`
	ViewProfile   bool   `json:"view_profile"`
	ProposeAPI    bool   `json:"share_api"`
	CreateApp     bool   `json:"create_app"`
	ConsumeTokens bool   `json:"consumeTokens"`
	IsAccess      bool   `json:"is_access"`
	Email         string `json:"email"`
	RefreshID     string `json:"refresh_id"`
}

func (token JwtToken) GetUser() *models.User {

	if !token.IsAccess {
		return nil
	}

	database, err := db.GetDatabaseClient()

	if err != nil {
		panic(err)
	}

	col := database.Collection("user")

	var user models.User

	filter := bson.D{{"_id", token.Email}}
	err = col.FindOne(context.TODO(), filter).Decode(&user)

	if err != nil {
		panic(err)
	}

	return &user
}

func (token JwtToken) IsExpired() bool {
	now := time.Now().Unix()
	return token.ExpiresAt.Unix() < now
}

func (token JwtToken) RefreshAccess(accessToken *JwtToken) (error, string, int) {

	if token.ID != accessToken.RefreshID {
		// check that access token is related to refresh token
		return errors.New("tokens do not match"), "", http.StatusUnauthorized
	}

	if token.IsExpired() {
		// check that refresh token is not expired
		return errors.New("refresh token is expired"), "", http.StatusUnauthorized
	}

	issuedAt := accessToken.IssuedAt.Time

	expirationMinutes := accessToken.ExpiresAt.Sub(issuedAt).Minutes()
	tokenId := uuid.New()

	tokenString, er := genJWTTokenFromToken(uint16(expirationMinutes), tokenId, accessToken)

	return er, tokenString, http.StatusOK
}

func genJWTTokenFromToken(
	expirationMinutes uint16,
	tokenId uuid.UUID,
	token *JwtToken) (string, error) {

	now := time.Now()
	exp := now.Add(time.Minute * time.Duration(expirationMinutes))

	token.IssuedAt = jwt.NewNumericDate(now)
	token.ExpiresAt = jwt.NewNumericDate(exp)
	token.ID = tokenId.String()

	key := []byte(os.Getenv("SECRET_KEY"))

	newToken := jwt.NewWithClaims(jwt.SigningMethodHS256, token)

	if signedToken, err := newToken.SignedString(key); err != nil {
		fmt.Printf("Unable to sign token because: %s \n", err)
		return "", err
	} else {
		return signedToken, nil
	}
}

func genJWTToken(
	tokenId uuid.UUID,
	subject string,
	additionalClaims map[string]interface{},
	expirationMinutes uint16) (string, error) {

	key := []byte(os.Getenv("SECRET_KEY"))

	now := time.Now()

	mapClaims := jwt.MapClaims{
		"iss": "Bench AI",
		"sub": subject,
		"iat": now.Unix(),
		"exp": now.Add(time.Minute * time.Duration(expirationMinutes)).Unix(),
		"jti": tokenId.String(),
	}

	for k, v := range additionalClaims {
		mapClaims[k] = v
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		mapClaims)

	if signedToken, err := token.SignedString(key); err != nil {
		fmt.Printf("Unable to sign token because: %s \n", err)
		return "", err
	} else {
		return signedToken, nil
	}

}

func GenRefreshToken(username string) (string, uuid.UUID, error) {
	refreshClaims := map[string]interface{}{
		"is_access": false,
	}

	refreshID := uuid.New()

	token, err := genJWTToken(refreshID, username, refreshClaims, 1)

	return token, refreshID, err
}

func GenBasicAccessToken(username string, email string, refreshID uuid.UUID) (string, error) {
	accessClaims := map[string]interface{}{
		"is_access":  true,
		"email":      email,
		"refresh_id": refreshID.String(),
		"try_apps":   true,
	}

	accessID := uuid.New()

	token, err := genJWTToken(accessID, username, accessClaims, 1)

	return token, err
}

func ParseToken(tokenString string) (error, error, *JwtToken, bool) {

	token, err := jwt.ParseWithClaims(tokenString, &JwtToken{}, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
		return []byte(os.Getenv("SECRET_KEY")), nil
	})

	if token == nil {
		return err, nil, nil, false
	}

	if clm, ok := token.Claims.(*JwtToken); ok {
		return err, nil, clm, token.Valid
	} else {
		return err, errors.New("can't parse token claims"), nil, token.Valid
	}

}
