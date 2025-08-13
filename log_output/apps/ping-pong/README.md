# Ping Pong Application

A simple Node.js web server that:

* Maintains an in-memory request counter

* Expose a GET /pingpong endpoint that return "pong <current_counter>"

* Increments the counter with each request (start at 0), and save the counter in a file

* Configurable port via environment variable (PORT)

* Configurable counter file via environment variable (COUNTER_FILE_PATH), the default counter file is "shared-data/counter.txt"

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

Execute in a defafult port(3001):

  ```bash
    $ npm start 

  > ping-pong-app@2.0.0 start
  > node index.js

  Ping-pong service started on port 3001

  ```

  **verify:**

  ```bash
  $ curl http://localhost:3001/pingpong
  pon 0

  $ curl http://localhost:3001/pingpong
  pon 1

  $ curl http://localhost:3001/pingpong
  pon 2

  ```

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/pingpong-app:2.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/pingpong-app:2.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/pingpong-app:2.0](https://hub.docker.com/r/yakovyakov/pingpong-app/tags?name=2.0)
