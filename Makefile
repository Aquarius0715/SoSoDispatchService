# Makefile
COMPOSE_FILE := deployments/docker/docker-compose.yml
DC := docker compose -f $(COMPOSE_FILE)

.PHONY: up down build rebuild pull logs ps api-sh db-sh prune watch

# 最小起動
up:
	$(DC) up -d

down:
	$(DC) down

# 変更分をビルドして起動
build:
	$(DC) build soso-api
	$(DC) up -d soso-api

# 全部作り直し（よく使う）
rebuild:
	$(DC) down
	$(DC) build --no-cache
	$(DC) up -d

# 依存イメージ更新
pull:
	$(DC) pull

logs:
	$(DC) logs -f

ps:
	$(DC) ps

# APIコンテナに入る
api-sh:
	$(DC) exec soso-api sh

# DBコンテナに入る
db-sh:
	$(DC) exec soso-database bash

# 未使用ボリューム/ネットワーク掃除
prune:
	docker system prune -f

# compose v2.22~ の watch（自動再ビルド/再起動）
watch:
	COMPOSE_FILE=$(COMPOSE_FILE) docker compose watch
