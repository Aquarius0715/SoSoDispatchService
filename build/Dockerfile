# syntax=docker/dockerfile:1

FROM golang:1.24.5 AS builder
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
ENV CGO_ENABLED=0
RUN go build -o /app/server ./cmd/server

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/server /app/server
EXPOSE 8080
ENTRYPOINT ["/app/server"]
