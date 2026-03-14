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
	$(DC) build --no-cache soso-api soso-database soso-api-document
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

# --- project dump settings ---
DUMP_OUT ?= project_dump.txt
MAX_LINES ?= 5000
MAX_BYTES ?= 2000000000

TREE_IGNORE := node_modules|.git|dist|build|.next|.turbo|vendor|__pycache__|.venv

# 対象拡張子（必要に応じて増減）
FIND_INCLUDE := \
	-name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o \
	-name "*.go" -o -name "*.java" -o -name "*.py" -o \
	-name "*.php" -o -name "*.rb" -o -name "*.rs" -o \
	-name "*.c" -o -name "*.cpp" -o -name "*.h" -o \
	-name "*.html" -o -name "*.css" -o -name "*.scss" -o \
	-name "*.json" -o -name "*.yml" -o -name "*.yaml" -o \
	-name "*.md" -o -name "*.txt" -o -name "*.sql" -o -name "*.env" -o \
	-name "Dockerfile" -o -name "docker-compose.yml"

.PHONY: dump
dump:
	@set -e; \
	OUT="$(DUMP_OUT)"; \
	if [ -z "$$OUT" ]; then echo "ERROR: DUMP_OUT is empty"; exit 2; fi; \
	: > "$$OUT"; \
	echo "===== DIRECTORY TREE =====" >> "$$OUT"; \
	if command -v tree >/dev/null 2>&1; then \
		tree -a -I '$(TREE_IGNORE)' >> "$$OUT"; \
	else \
		find . -type d \
			-not -path '*/node_modules*' -not -path '*/.git*' -not -path '*/dist*' -not -path '*/build*' -not -path '*/.next*' -not -path '*/.turbo*' \
			| sed 's|[^/]*/|  |g' >> "$$OUT"; \
	fi; \
	echo "" >> "$$OUT"; \
	echo "===== FILE CONTENTS =====" >> "$$OUT"; \
	get_size(){ if stat -f%z "$$1" >/dev/null 2>&1; then stat -f%z "$$1"; else stat -c%s "$$1"; fi; }; \
	if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then \
		git ls-files -z | while IFS= read -r -d '' f; do \
			case "$$f" in node_modules/*|.git/*|dist/*|build/*|.next/*|.turbo/*|vendor/*|__pycache__/*|.venv/*) continue ;; esac; \
			case "$$f" in \
				*.ts|*.tsx|*.js|*.jsx|*.go|*.java|*.py|*.php|*.rb|*.rs|*.c|*.cpp|*.h|*.html|*.css|*.scss|*.json|*.yml|*.yaml|*.md|*.txt|*.sql|*.env|Dockerfile|docker-compose.yml \
			) ;; * ) continue ;; esac; \
			size="$$(get_size "$$f")"; \
			echo "" >> "$$OUT"; \
			echo "----- FILE: $$f (size=$$size) -----" >> "$$OUT"; \
			if [ "$$size" -gt "$(MAX_BYTES)" ]; then \
				echo "[SKIP] too large (MAX_BYTES=$(MAX_BYTES))" >> "$$OUT"; \
				continue; \
			fi; \
			sed -n "1,$(MAX_LINES)p" "$$f" >> "$$OUT"; \
			echo "" >> "$$OUT"; \
			echo "[TRUNCATED] MAX_LINES=$(MAX_LINES)" >> "$$OUT"; \
		done; \
	else \
		find . -type f \( $(FIND_INCLUDE) \) \
			-not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/.next/*' -not -path '*/.turbo/*' \
			-print0 | while IFS= read -r -d '' f; do \
				size="$$(get_size "$$f")"; \
				echo "" >> "$$OUT"; \
				echo "----- FILE: $$f (size=$$size) -----" >> "$$OUT"; \
				if [ "$$size" -gt "$(MAX_BYTES)" ]; then \
					echo "[SKIP] too large (MAX_BYTES=$(MAX_BYTES))" >> "$$OUT"; \
					continue; \
				fi; \
				sed -n "1,$(MAX_LINES)p" "$$f" >> "$$OUT"; \
				echo "" >> "$$OUT"; \
				echo "[TRUNCATED] MAX_LINES=$(MAX_LINES)" >> "$$OUT"; \
			done; \
	fi; \
	echo "DONE -> $$OUT"
