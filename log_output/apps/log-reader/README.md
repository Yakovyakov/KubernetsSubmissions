# Log Reader Application

A simple Node.js web server that:

* Expose two HTTP GET endpoints:
  * `/logs`: Read a log file and provides the content
  * `/status`: Parse the last log entry from a JSON Lines file and return a human-readable flat format, including:
    * Content from the ConfigMap file (`information.txt`)
    * Environment variable (`MESSAGE`)
    * Timestamp and UUID
    * Ping counter

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

    > log-reader@2.0.0 start
    > node index.js

    Server(log-reader) started on port 8080
  ```

  **verify:**

  The log file contains structured entries in JSON Lines format like:

  ```json
  {"timestamp":"2025-08-05T13:23:10.469Z","uuid":"32f4ad5-50e2-4373-99a5-af037858ba55","fileContent":"this text is from file","message":"hello world","pings":5}
  {"timestamp":"2025-08-05T13:23:15.476Z","uuid":"32f4ad5-50e2-4373-99a5-af037858ba55","fileContent":"this text is from file","message":"hello world","pings":7}
  ```

  ```bash
  $ curl http://localhost:8080/logs
  {"timestamp":"2025-08-05T13:23:10.469Z","uuid":"32f4ad5-50e2-4373-99a5-af037858ba55","fileContent":"this text is from file","message":"hello world","pings":5}
  {"timestamp":"2025-08-05T13:23:15.476Z","uuid":"32f4ad5-50e2-4373-99a5-af037858ba55","fileContent":"this text is from file","message":"hello world","pings":7}
  ```

  Despite the internal format, `/status` returns a flat, human-readable version:

  ```bash
  $ curl http://localhost:8080/status
  file content: this text is from file
  env variable: MESSAGE=hello world
  2025-08-05T13:23:15.476Z: 32f4ad5-50e2-4373-99a5-af037858ba55
  Ping / Pongs: 7
  ```

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/log-reader:3.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/log-reader:3.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/log-reader:3.0](https://hub.docker.com/r/yakovyakov/log-reader/tags?name=3.0)
