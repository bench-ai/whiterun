package controllers

import (
	"ApiExecutor/miscellaneous"
	"bytes"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"strings"
)

func Proxy(c *gin.Context) {

	targetUrl := c.GetHeader("Request-Url")
	contentType := c.GetHeader("Content-Type")

	var pResponse *http.Response
	var rError error

	methodList := []string{
		"TRACE", "GET", "DELETE", "OPTIONS", "HEAD", "CONNECT",
	}

	contains := miscellaneous.Contains[string]

	if targetUrl == "" {
		c.String(http.StatusBadRequest, "invalid url")
		return
	}

	fmt.Println(c.Request.Method)

	if contains(strings.ToUpper(c.Request.Method), methodList) {
		pResponse, rError = forwardBodylessRequest(c, targetUrl)
	} else if strings.HasPrefix(contentType, "multipart/form-data") {
		pResponse, rError = forwardMultipartRequest(c, targetUrl)
	} else if strings.HasPrefix(contentType, "application/x-www-form-urlencoded") {
		pResponse, rError = forwardXWFormRequest(c, targetUrl)
	} else if strings.HasPrefix(contentType, "application/json") {
		pResponse, rError = forwardJsonRequest(c, targetUrl)
	} else {
		c.String(http.StatusBadRequest, "invalid Content-Type")
		return
	}

	if rError != nil {
		c.String(http.StatusInternalServerError, "")
		fmt.Println(rError)
		return
	}

	CopyResponse(c.Writer, pResponse)
}

func writeHeaders(newReq *http.Request, oldReq *http.Request) {
	for k, valueList := range oldReq.Header {
		for _, value := range valueList {
			if strings.HasPrefix(strings.ToLower(k), "bench-") {
				newReq.Header.Add(k[len("bench-"):], value)
			}
		}
	}
}

func forwardBodylessRequest(c *gin.Context, targetUrl string) (*http.Response, error) {
	newReq, err := http.NewRequest(c.Request.Method, targetUrl, nil)

	if err != nil {
		return nil, err
	}

	writeHeaders(newReq, c.Request)
	return http.DefaultClient.Do(newReq)
}

func forwardJsonRequest(c *gin.Context, targetUrl string) (*http.Response, error) {

	newReq, err := http.NewRequest(c.Request.Method, targetUrl, c.Request.Body)
	if err != nil {
		return nil, err
	}

	newReq.Header.Set("Content-Type", "application/json")
	writeHeaders(newReq, c.Request)

	return http.DefaultClient.Do(newReq)
}

func forwardXWFormRequest(c *gin.Context, targetUrl string) (*http.Response, error) {
	err := c.Request.ParseForm()

	if err != nil {
		return nil, err
	}

	formData := url.Values{}

	for k, valueList := range c.Request.PostForm {
		for _, value := range valueList {
			formData.Add(k, value)
		}
	}

	req, err := http.NewRequest(c.Request.Method, targetUrl, nil)
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	writeHeaders(req, c.Request)

	req.Body = io.NopCloser(strings.NewReader(formData.Encode()))

	return http.DefaultClient.Do(req)
}

func forwardMultipartRequest(c *gin.Context, targetUrl string) (*http.Response, error) {

	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)

	form, err := c.MultipartForm()

	if err != nil {
		panic(err)
	}

	for k, v := range form.File {

		for _, formFile := range v {
			fw, err := w.CreateFormFile(k, formFile.Filename)

			if err != nil {
				return nil, err
			}

			file, err := formFile.Open()

			if err != nil {
				return nil, err
			}

			if _, err := io.Copy(fw, file); err != nil {
				log.Fatal(err)
			}

			if err != nil {
				return nil, err
			}

			err = file.Close()

			if err != nil {
				return nil, err
			}
		}
	}

	for k, v := range form.Value {
		for _, val := range v {
			err := w.WriteField(k, val)
			if err != nil {
				return nil, err
			}
		}
	}

	err = w.Close()

	if err != nil {
		return nil, err
	}

	payload := bytes.NewReader(buf.Bytes())
	newReq, err := http.NewRequest(c.Request.Method, targetUrl, payload)

	writeHeaders(newReq, c.Request)

	newReq.Header.Set("Content-Type", w.FormDataContentType())

	if err != nil {
		return nil, err
	}

	return http.DefaultClient.Do(newReq)
}

func CopyResponse(w http.ResponseWriter, resp *http.Response) {

	w.WriteHeader(resp.StatusCode)

	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	defer func(Body io.ReadCloser) {
		e := Body.Close()
		if e != nil {
			panic(e)
		}
	}(resp.Body)

	contentDisposition := resp.Header.Get("Content-Disposition")
	if strings.HasPrefix(contentDisposition, "attachment") {
		// If it's an attachment, set appropriate headers
		w.Header().Set("Content-Disposition", contentDisposition)
		w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	}

	_, err = w.Write(body)
	if err != nil {
		panic(err)
	}

}
