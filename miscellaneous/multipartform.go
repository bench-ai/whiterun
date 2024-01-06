package miscellaneous

import (
	"bytes"
	"mime/multipart"
)

type multipartForm struct {
	form   *bytes.Buffer
	writer *multipart.Writer
}

type MultiPartFormBuilder struct {
	mpf multipartForm
}

func (mpfBuilder *MultiPartFormBuilder) AddField(key string, value string) *MultiPartFormBuilder {
	err := mpfBuilder.mpf.writer.WriteField(key, value)

	if err != nil {
		panic(err)
	}

	return mpfBuilder
}

func (mpfBuilder *MultiPartFormBuilder) AddFile(key string, fileName string, content []byte) *MultiPartFormBuilder {

	fileWriter, err := mpfBuilder.mpf.writer.CreateFormFile(key, fileName)

	if err != nil {
		panic(err)
	}

	_, err = fileWriter.Write(content)

	if err != nil {
		panic(err)
	}

	return mpfBuilder
}

func (mpfBuilder *MultiPartFormBuilder) Finish() (*bytes.Buffer, string) {
	err := mpfBuilder.mpf.writer.Close()
	if err != nil {
		return nil, ""
	}

	return mpfBuilder.mpf.form, mpfBuilder.mpf.writer.FormDataContentType()
}

func NewMultiPartFormBuilder() MultiPartFormBuilder {
	form := &bytes.Buffer{}
	writer := multipart.NewWriter(form)

	return MultiPartFormBuilder{
		mpf: multipartForm{
			form:   form,
			writer: writer,
		},
	}
}
