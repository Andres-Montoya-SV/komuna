package validator

import (
	"log"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func Init() {
	validate = validator.New()
}

// ValidateStruct validates a struct and returns formatted errors.
func ValidateStruct(s interface{}) error {
	if validate == nil {
		Init()
	}
	return validate.Struct(s)
}

// FormatValidationErrors converts validator errors to a friendly map.
// Not strictly needed if we just return the error string, but helpful.
func FormatValidationErrors(err error) map[string]string {
	fields := make(map[string]string)
	if err == nil {
		return nil
	}

	validatorErrs, ok := err.(validator.ValidationErrors)
	if !ok {
		// Non-validation error
		fields["error"] = err.Error()
		return fields
	}

	for _, e := range validatorErrs {
		fields[strings.ToLower(e.Field())] = e.Error()
	}

	log.Printf("Validation errors: %v", fields)
	return fields
}
