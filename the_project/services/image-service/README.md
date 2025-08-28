# Image Service

## Description

Microservice providing random images with persistent caching, fetched from Lorem Picsum.

## Local Development

```bash
npm install
npm start
```

### Environment variables

| ENV VAR    | DEFAULT     | PURPOSE          |
|------------|-------------|------------------|
| PORT       | 3001        | Service port     |
| CACHE_DIR  | (Current path) | Cache storage    |
| CACHE_TIME | 600000      | Cache TTL (ms)   |
| API_IMAGE_URL | `https://picsum.photos/1200` | URL for downloading random images |

## Endpoints

* `GET /random-image` - Current cached image

* `GET /simulate-crash` - Recovery test (dev only)

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/image-service:2.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/image-service:2.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/image-service:2.0](https://hub.docker.com/r/yakovyakov/image-service/tags?name=2.0)
