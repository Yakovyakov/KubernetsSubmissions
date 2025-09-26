# Ping Pong Application

A simple Node.js web server that:

* **Stores and retrieves a request counter from a PostgreSQL database** (instead of in-memory or file-based storage)
* Exposes a GET /pingpong endpoint that returns "pong <current_counter>"
  * Increments the counter with each request (starting at 0) and persists it in the database
* Exposes a GET /pings endpoint that returns { "pings": <current_counter> }
* Configurable port via environment variable (PORT)
* Database connection configurable via environment variables:
  * `DB_HOST` (default: postgres-svc)
  * `DB_PORT` (default: 5432)
  * `DB_NAME` (default: pingpong)
  * `DB_USER` (default: postgres)
  * `DB_PASSWORD` (default: password)

## Running the Application Locally

**Install dependencies:**

  ```bash
  npm install
  ```

**Start the application:**

  ```bash
  npm run start
  ```

## Verify the Application Locally

Execute in a defafult port(3002):

  ```bash
    $ npm start 

  > ping-pong-app@2.0.0 start
  > node index.js

  Ping-pong service with PostgreSQL started on port 3002

  ```

1. Get and increment counter:

    ```bash
    $ curl http://localhost:3002/pingpong
    pong 0

    $ curl http://localhost:3002/pingpong
    pong 1

    $ curl http://localhost:3002/pingpong
    pong 2

    ```

2. Get current counter:

    ```bash
    $ curl http://localhost:3002/pings
    {"pings":2}
    ```

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/pingpong-app:3.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/pingpong-app:3.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/pingpong-app:3.0](https://hub.docker.com/r/yakovyakov/pingpong-app/tags?name=3.0)
