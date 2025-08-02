FROM golang:1.24.5 AS builder

WORKDIR /app

COPY services/soso-api/go.mod services/soso-api/go.sum ./
RUN go mod download

COPY services/soso-api/ .

ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64

RUN go build -o server ./cmd/server

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /app/server /app/server

EXPOSE 8080

ENTRYPOINT ["/app/server"]
