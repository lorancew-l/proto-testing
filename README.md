# Запуск проекта

## Установка зависимостей

```sh
pnpm install --frozen-lockfile
```

## Создание .env

```sh
cp ./packages/admin-backend/.env.example ./packages/admin-backend/.env &&
cp ./packages/admin-frontend/.env.example ./packages/admin-frontend/.env &&
cp ./packages/respondent-frontend/.env.example ./packages/respondent-frontend/.env &&
cp ./packages/respondent-backend/.env.example ./packages/respondent-backend/.env &&
cp ./packages/event-collector/.env.example ./packages/event-collector/.env
```

## Запуск контейнеров

```sh
docker compose up -d
```

## База данных

### Генерация типов БД

```sh
pnpm --filter 'admin-backend' db:generate
```

### Миграция

```sh
pnpm --filter 'admin-backend' db:migrate:dev
```

### Просмотр БД

```sh
pnpm --filter 'admin-backend' db:view
```

## Загрузка бандла респондентской части

```sh
docker build -f Dockerfile.respondent-frontend -t respondent-frontend .
docker run --network="host" --env-file ./packages/respondent-frontend/.env respondent-frontend
```

## Запуск проекта в dev-режиме

```sh
pnpm start:dev:admin-backend
pnpm start:dev:admin-frontend
pnpm start:dev:respondent-frontend
pnpm start:dev:respondent-backend
pnpm start:dev:event-collector
```

## Запуск проекта в prod-режиме

```sh
docker-compose -f docker-compose.prod.yml -p proto-testing-prod --env-file .env up -d --build
```
