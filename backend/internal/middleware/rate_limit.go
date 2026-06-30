package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type slidingLimiter struct {
	mu      sync.Mutex
	clients map[string][]time.Time
	limit   int
	window  time.Duration
}

func newSlidingLimiter(limit int, window time.Duration) *slidingLimiter {
	l := &slidingLimiter{
		clients: make(map[string][]time.Time),
		limit:   limit,
		window:  window,
	}
	go l.cleanup()
	return l
}

func (l *slidingLimiter) allow(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	cutoff := now.Add(-l.window)
	var recent []time.Time
	for _, t := range l.clients[ip] {
		if t.After(cutoff) {
			recent = append(recent, t)
		}
	}
	if len(recent) >= l.limit {
		l.clients[ip] = recent
		return false
	}
	l.clients[ip] = append(recent, now)
	return true
}

func (l *slidingLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		l.mu.Lock()
		cutoff := time.Now().Add(-l.window)
		for ip, times := range l.clients {
			var recent []time.Time
			for _, t := range times {
				if t.After(cutoff) {
					recent = append(recent, t)
				}
			}
			if len(recent) == 0 {
				delete(l.clients, ip)
			} else {
				l.clients[ip] = recent
			}
		}
		l.mu.Unlock()
	}
}

// authLimiter allows 10 attempts per minute per IP.
var authLimiter = newSlidingLimiter(10, time.Minute)

func AuthRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !authLimiter.allow(c.ClientIP()) {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "too many requests, please try again later"})
			c.Abort()
			return
		}
		c.Next()
	}
}
