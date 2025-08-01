FROM golang:1.24.5 AS builder

WORKDIR /src

COPY . .

RUN go build -o /app/server ./services/soso-api/cmd/server

FROM alpine:3.20

COPY --from=builder /app/server /app/server

EXPOSE 8080

ENTRYPOINT ["/app/server"]
