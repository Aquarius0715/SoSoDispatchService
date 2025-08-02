FROM golang:1.24.5 AS builder

WORKDIR /app

COPY services/soso-api/ .

RUN go mod tidy

RUN go build -o /app/server ./cmd/server

FROM alpine:3.20

COPY --from=builder /app/server /app/server

EXPOSE 8080

ENTRYPOINT ["/app/server"]