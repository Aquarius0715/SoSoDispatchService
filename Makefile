# Makefile - SoSoDispatchService 用
COMPOSE_FILE := docker-compose.yml
DC := docker compose -f $(COMPOSE_FILE)

.PHONY: up down build rebuild pull logs ps api-sh db-sh prune watch env

## 起動（全サービス）
up:
	$(DC) up -d

## 停止
down:
	$(DC) down

## APIのみビルドして起動
build:
	$(DC) build soso-api
	$(DC) up -d soso-api

api:
	$(DC) build soso-api soso-database soso-api-document
	$(DC) up -d soso-api soso-database soso-api-document

# Storybook 使うときだけ明示してビルド/起動
storybook-up:
	COMPOSE_PROFILES=storybook $(DC) up -d soso-web-storybook

storybook-build:
	COMPOSE_PROFILES=storybook $(DC) build --no-cache soso-web-storybook
	COMPOSE_PROFILES=storybook $(DC) up -d soso-web-storybook

## Storybook以外ビルドし直して起動（キャッシュなし）
rebuild:
	$(DC) down -v --remove-orphans
	$(DC) build --no-cache soso-api soso-database soso-api-document soso-web
	$(DC) up -d

dev:
	$(DC) down
	$(DC) build soso-api soso-web --no-cache
	$(DC) up -d

## イメージの pull（依存イメージの更新）
pull:
	$(DC) pull

## ログ監視（全サービス）
logs:
	$(DC) logs -f

## コンテナ状態一覧
ps:
	$(DC) ps

## soso-api コンテナにシェルログイン
api-sh:
	$(DC) exec soso-api sh

## soso-database コンテナにログイン（MySQL入り Alpine/Ubuntu に対応）
db-sh:
	$(DC) exec soso-database sh || $(DC) exec soso-database bash

## 未使用ネットワークやボリューム削除
prune:
	docker system prune -f

## .env 中身を確認（API用）
env:
	cat services/soso-api/config/.env

## Docker Compose v2.22〜 の hot-reload
watch:
	@version=$$(docker compose version --short); \
	if [ "$$(printf '%s\n' "2.22.0" "$$version" | sort -V | head -n1)" = "2.22.0" ]; then \
		COMPOSE_FILE=$(COMPOSE_FILE) docker compose watch; \
	else \
		echo "❌ 'docker compose watch' には v2.22.0 以上が必要です（現在: $$version）"; \
	fi
