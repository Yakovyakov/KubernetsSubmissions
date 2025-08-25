# Todo Backend Service

A lighweight, self-contaned todo microservice built with Node.js and Express.

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

## Endpoints

* `GET /todos` - GET All Todos

* `POST /todos` - Create a new Todo

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/todo-backend:1.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/todo-backend:1.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/todo-backend:1.0](https://hub.docker.com/r/yakovyakov/todo-backend/tags?name=1.0)
