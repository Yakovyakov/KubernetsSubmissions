# Todo Backend Service

A lighweight, self-contaned todo microservice built with Node.js, Express and PostgreSQL.

## Description

This is a minimalist microservice for managing todo items. The API features console error logging for debugging and monitoring purposes.

## Local Development

```bash
npm install
npm run start
```

### Environment variables

| ENV VAR    | DEFAULT     | PURPOSE          |
|------------|-------------|------------------|
| PORT       | 3001        | Service port     |
| DB_HOST | postgres-svc | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | todo-db | PostgreSQL database name |
| DB_USER | postgres | PostgreSQL user |
| DB_PASSWORD | password | PostgreSQL password |

## Endpoints

* `GET /todos` - GET All Todos

* `POST /todos` - Create a new Todo

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/todo-backend:2.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/todo-backend:2.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/todo-backend:2.0](https://hub.docker.com/r/yakovyakov/todo-backend/tags?name=2.0)
