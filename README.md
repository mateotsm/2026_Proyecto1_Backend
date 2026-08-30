# Backend API

API backend desarrollada con NestJS + TypeORM para gestión comercial. El proyecto expone endpoints REST para usuarios, productos, clientes, proveedores, documentos y configuración del sistema.

## Stack
- Node.js 20+
- Yarn 1.x
- NestJS 11
- TypeScript
- MySQL 8
- TypeORM
- Docker Compose
- Swagger

## Requisitos
- Docker
- Node.js 20+
- Yarn
- Archivo `.env` local (no se sube a Git)

## Variables de entorno
Crear un archivo `.env` en la raíz del proyecto con este contenido:

```env
DB_PORT=3310
DB_HOST=localhost
DB_USERNAME=admin
DB_PASSWORD=admin
DB_DATABASE=proyecto

PORT=3000
DB_TYPE=mysql
DB_SSL=false
JWT_SECRET=tu_secret
JWT_EXPIRATION_ACCESS=60s
JWT_EXPIRATION_REFRESH=7d
PUNTO_VENTA_ACTIVO_ID=2
```

## Levantar el proyecto localmente

### 1) Instalar dependencias
```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn install
```

### 2) Levantar MySQL
```bash
docker compose up -d
```

Esto levanta:
- MySQL en `localhost:3310`
- phpMyAdmin en `http://localhost:8081`

### 3) Ejecutar migraciones
```bash
yarn migration:run
```

### 4) Iniciar la API
```bash
yarn start:dev
```

La aplicación queda disponible en: http://localhost:3000
- Swagger: http://localhost:3000/api

## Comandos útiles
```bash
yarn start
yarn start:dev
yarn build
yarn test
yarn migration:run
yarn migration:revert
```

## Estructura principal
- `src/`: código fuente de la API
- `src/modules/`: módulos funcionales del sistema
- `src/migrations/`: migraciones de TypeORM
- `docker-compose.yml`: configuración de MySQL y phpMyAdmin
- `orm.config.ts`: configuración de TypeORM

## Importante
- No subir el archivo `.env` al repositorio.
- Mantener `DB_HOST`, `DB_PORT` y `DB_DATABASE` consistentes con la base de datos local.
- Si el frontend está en otro repositorio, debe apuntar a esta API con el CORS configurado correctamente.

## Despliegue en la nube
Este backend se puede desplegar como API REST en un servicio web (Render, Azure App Service, Railway, etc.) con MySQL gestionado. El frontend debe estar en un repositorio separado y consumir esta API.

