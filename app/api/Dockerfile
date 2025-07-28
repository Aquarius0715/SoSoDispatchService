FROM golang:1.24.5-alpine
RUN apk add --no-cache bash git ca-certificates curl && update-ca-certificates
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY src ./src
COPY docs ./docs
EXPOSE 8080
CMD ["go", "run", "./src/main.go"]
