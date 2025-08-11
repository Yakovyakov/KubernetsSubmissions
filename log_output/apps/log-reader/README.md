# Log Reader Application

A simple Node.js web server that:

* Read a log file and provides the content in the HTTP GET endpoint

* Prints "Server(<\app-name>) started in port ${PORT}" on startup

* Configurable port via environment variable (PORT)

* Configurable log file via environment variable (LOG_FILE_PATH), the default log file is "shared-logs/output.log"

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

Execute in a defafult port(8080):

  ```bash
    $ npm start 

    > log-reader@1.0.0 start
    > node index.js

    Server(log-reader) started on port 8080
  ```

  **verify:**

  ```bash
  $ curl http://localhost:8080/logs
  2025-08-08T18:35:58.065Z: 845616a-abd8-4d85-9851-64f7fc631222
  ```

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/log-reader:1.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/log-reader:1.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/log-reader:1.0](https://hub.docker.com/r/yakovyakov/log-reader/tags?name=1.0)
