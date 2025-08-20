# Log Writer Application

A simple Node.js application that:

* Generates a random string(version 4 UUID) on startup, stores it in memory

* Every 5 seconds, the service queries the GET endpoint at <\pingpong-server>/pings to retrieve the counter value, and write the saved random string and the counter along with an ISO-format timestamp to a log file. The output format for the logs is exactly:

  ```text
  YYYY-MM-DDTHH:MM:SS.sssZ: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx. Ping / Pongs: <\counter>
  ```

  **Example output:**

    ```text
    2025-07-25T14:30:45.128Z: 7b3e5b91-3c45-4a23-9a8b-12d4e6f8a2c1. Ping / Pongs: 3
    ```

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
    
    2025-08-05T13:23:10.469Z: 32f4ad5-50e2-4373-99a5-af037858ba55Ping / Pongs: 5  # <- logs in stdout>
    2025-08-05T13:23:15.476Z: 32f4ad5-50e2-4373-99a5-af037858ba55. Ping / Pongs: 7 # <- logs in stdout>

  ```

  **verify:**

  ```bash
  $ cat ./shared-logs/output.log
    2025-08-05T13:23:10.469Z: 32f4ad5-50e2-4373-99a5-af037858ba55. Ping / Pongs: 5
    2025-08-05T13:23:15.476Z: 32f4ad5-50e2-4373-99a5-af037858ba55. Ping / Pongs: 7
  ```

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/log-writer:3.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/log-writer:3.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/log-writer:3.0](https://hub.docker.com/r/yakovyakov/log-writer/tags?name=3.0)
