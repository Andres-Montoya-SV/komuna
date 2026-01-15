package errors

import "github.com/gofiber/fiber/v2"

type HTTPError struct {
	Code    int    `json:"-"`
	Message string `json:"message"`
}

func (e *HTTPError) Error() string {
	return e.Message
}

/*
|--------------------------------------------------------------------------
| 4xx — Client Errors
|--------------------------------------------------------------------------
*/

func BadRequest(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusBadRequest, // 400
		Message: msg,
	}
}

func Unauthorized(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusUnauthorized, // 401
		Message: msg,
	}
}

func PaymentRequired(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusPaymentRequired, // 402
		Message: msg,
	}
}

func Forbidden(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusForbidden, // 403
		Message: msg,
	}
}

func NotFound(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusNotFound, // 404
		Message: msg,
	}
}

func MethodNotAllowed(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusMethodNotAllowed, // 405
		Message: msg,
	}
}

func NotAcceptable(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusNotAcceptable, // 406
		Message: msg,
	}
}

func ProxyAuthRequired(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusProxyAuthRequired, // 407
		Message: msg,
	}
}

func RequestTimeout(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusRequestTimeout, // 408
		Message: msg,
	}
}

func Conflict(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusConflict, // 409
		Message: msg,
	}
}

func Gone(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusGone, // 410
		Message: msg,
	}
}

func LengthRequired(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusLengthRequired, // 411
		Message: msg,
	}
}

func PreconditionFailed(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusPreconditionFailed, // 412
		Message: msg,
	}
}

func PayloadTooLarge(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusRequestEntityTooLarge, // 413
		Message: msg,
	}
}

func URITooLong(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusRequestURITooLong, // 414
		Message: msg,
	}
}

func UnsupportedMediaType(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusUnsupportedMediaType, // 415
		Message: msg,
	}
}

func RangeNotSatisfiable(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusRequestedRangeNotSatisfiable, // 416
		Message: msg,
	}
}

func ExpectationFailed(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusExpectationFailed, // 417
		Message: msg,
	}
}

func TooManyRequests(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusTooManyRequests, // 429
		Message: msg,
	}
}

func UnprocessableEntity(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusUnprocessableEntity, // 422
		Message: msg,
	}
}

/*
|--------------------------------------------------------------------------
| 5xx — Server Errors
|--------------------------------------------------------------------------
*/

func Internal(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusInternalServerError, // 500
		Message: msg,
	}
}

func NotImplemented(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusNotImplemented, // 501
		Message: msg,
	}
}

func BadGateway(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusBadGateway, // 502
		Message: msg,
	}
}

func ServiceUnavailable(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusServiceUnavailable, // 503
		Message: msg,
	}
}

func GatewayTimeout(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusGatewayTimeout, // 504
		Message: msg,
	}
}

func HTTPVersionNotSupported(msg string) error {
	return &HTTPError{
		Code:    fiber.StatusHTTPVersionNotSupported, // 505
		Message: msg,
	}
}
