package config

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	// App
	AppPort string

	// DB
	DBDSN            string
	DBMaxOpenConns   int
	DBMaxIdleConns   int
	DBConnMaxLifeDur time.Duration

	// JWT / Token
	AccessTokenTTLMin int
	RefreshTokenTTLH  int
	JWTSigningKey     string

	// Cookie (RefreshToken)
	CookieDomain   string
	CookiePath     string
	CookieSecure   bool
	CookieSameSite http.SameSite
	CookieNameRT   string

	// CORS
	CORSAllowOrigins     []string
	CORSAllowHeaders     []string
	CORSAllowMethods     []string
	CORSAllowCredentials bool

	// CSRF
	CSRFCookieName string
	CSRFHeaderName string
	CSRFEnabled    bool
}

func Load() *Config {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		user := mustEnv("DB_USER")
		pass := mustEnv("DB_PASSWORD")
		host := mustEnv("DB_HOST")
		port := mustEnv("DB_PORT")
		name := mustEnv("DB_NAME")
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&loc=Local", user, pass, host, port, name)
	}

	return &Config{
		AppPort:           getEnv("APP_PORT", "8080"),
		DBDSN:             dsn,
		DBMaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", 25),
		DBMaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", 25),
		DBConnMaxLifeDur:  getEnvDuration("DB_CONN_MAX_LIFETIME", "60m"),
		AccessTokenTTLMin: mustInt("ACCESS_TOKEN_TTL_MIN"),
		RefreshTokenTTLH:  mustInt("REFRESH_TOKEN_TTL_HOUR"),
		JWTSigningKey:     mustEnv("JWT_SIGNING_KEY"),

		CookieDomain:   getEnv("COOKIE_DOMAIN", ""),
		CookiePath:     getEnv("COOKIE_PATH", "/auth"),
		CookieSecure:   getEnvBool("COOKIE_SECURE", false),
		CookieSameSite: toSameSite(getEnv("COOKIE_SAMESITE", "Strict")),
		CookieNameRT:   getEnv("COOKIE_NAME_RT", "rt"),

		CORSAllowOrigins:     split(getEnv("CORS_ALLOW_ORIGINS", "http://localhost:3000")),
		CORSAllowHeaders:     split(getEnv("CORS_ALLOW_HEADERS", "Content-Type,Authorization,X-CSRF-Token")),
		CORSAllowMethods:     split(getEnv("CORS_ALLOW_METHODS", "GET,POST,PUT,DELETE,OPTIONS")),
		CORSAllowCredentials: getEnvBool("CORS_ALLOW_CREDENTIALS", true),

		CSRFCookieName: getEnv("CSRF_COOKIE_NAME", "XSRF-TOKEN"),
		CSRFHeaderName: getEnv("CSRF_HEADER_NAME", "X-CSRF-Token"),
		CSRFEnabled:    getEnv("CSRF_ENABLED", "true") != "false",
	}
}

// ---- helpers ----

func (c *Config) CSRFHeader() string {
	if c.CSRFHeaderName == "" {
		return "X-CSRF-Token"
	}
	return c.CSRFHeaderName
}

func split(s string) []string {
	var out []string
	for _, v := range strings.Split(s, ",") {
		v = strings.TrimSpace(v)
		if v != "" {
			out = append(out, v)
		}
	}
	return out
}

func toSameSite(v string) http.SameSite {
	switch strings.ToLower(v) {
	case "none":
		return http.SameSiteNoneMode
	case "lax":
		return http.SameSiteLaxMode
	default:
		return http.SameSiteStrictMode
	}
}

func mustEnv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		log.Fatalf("missing env: %s", k)
	}
	return v
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

func mustInt(k string) int {
	i, err := strconv.Atoi(mustEnv(k))
	if err != nil {
		log.Fatalf("env %s must be int: %v", k, err)
	}
	return i
}

func getEnvBool(k string, def bool) bool {
	v := os.Getenv(k)
	if v == "" {
		return def
	}
	switch strings.ToLower(v) {
	case "1", "true", "t", "yes", "y":
		return true
	default:
		return false
	}
}

func getEnvInt(k string, def int) int {
	if v := os.Getenv(k); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return def
}

func getEnvDuration(k, def string) time.Duration {
	v := os.Getenv(k)
	if v == "" {
		v = def
	}
	d, err := time.ParseDuration(v)
	if err != nil {
		return time.Minute
	}
	return d
}
