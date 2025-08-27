# Log Writer Application

A simple Node.js application that:

* Generates a random string (version 4 UUID) on startup, stores it in memory
* Every 5 seconds, the service queries the GET endpoint at `<pingpong-server>/pings` to retrieve the counter value
* Writes a structured log entry in **JSON Lines format** (one JSON object per line) containing:
  * Timestamp
  * UUID
  * Content from the ConfigMap file (`information.txt`)
  * Environment variable (`MESSAGE`)
  * Ping counter
* Configurable log file via environment variable (LOG_FILE_PATH), the default log file is "shared-logs/output.log"

* Configurable pingpong-server via environment variable (PING_SERVER_URL), the default is "http\://localhost" (useful for local development)

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

  ```bash
    $ npm start 
    
    > log-writer@2.0.0 start
    > node index.js
    
    {"timestamp":"2025-08-26T15:48:24.953Z","uuid":"10a5d22-47dc-4828-aa28-5b108295a08d","fileContent":"this text is from file","message":"hello world","pings":2} # <- logs in stdout>
    {"timestamp":"2025-08-26T15:48:29.960Z","uuid":"10a5d22-47dc-4828-aa28-5b108295a08d","fileContent":"this text is from file","message":"hello world","pings":3} # <- logs in stdout>
  ```

  **verify:**

  ```bash
  $ cat ./shared-logs/output.log
    {"timestamp":"2025-08-26T15:48:24.953Z","uuid":"10a5d22-47dc-4828-aa28-5b108295a08d","fileContent":"this text is from file","message":"hello world","pings":2}
    {"timestamp":"2025-08-26T15:48:29.960Z","uuid":"10a5d22-47dc-4828-aa28-5b108295a08d","fileContent":"this text is from file","message":"hello world","pings":3}
    
  ```

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/log-writer:4.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/log-writer:4.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/log-writer:4.0](https://hub.docker.com/r/yakovyakov/log-writer/tags?name=4.0)
