package ratelimit

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestLimiter_AllowsWithinLimit(t *testing.T) {
	limiter := New(3, time.Second)

	for i := 0; i < 3; i++ {
		allowed := limiter.Allow("client1")
		assert.True(t, allowed)
	}
}

func TestLimiter_BlocksAfterLimit(t *testing.T) {
	limiter := New(2, time.Second)

	assert.True(t, limiter.Allow("client1"))
	assert.True(t, limiter.Allow("client1"))

	allowed := limiter.Allow("client1")
	assert.False(t, allowed)
}

func TestLimiter_ResetsAfterWindow(t *testing.T) {
	limiter := New(1, 100*time.Millisecond)

	assert.True(t, limiter.Allow("client1"))

	time.Sleep(150 * time.Millisecond)

	assert.True(t, limiter.Allow("client1"))
}
