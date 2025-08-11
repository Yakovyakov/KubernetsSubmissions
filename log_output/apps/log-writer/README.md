# Log Writer Application

A simple Node.js application that:

* Generates a random string(version 4 UUID) on startup, stores it in memory

* Write the saved random string to a log file every 5 seconds along with an ISO-format timestamp. The output format for the logs is exactly:

  ```text
  YYYY-MM-DDTHH:MM:SS.sssZ: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  ```

  **Example output:**

    ```text
    2025-07-25T14:30:45.128Z: 7b3e5b91-3c45-4a23-9a8b-12d4e6f8a2c1
    ```

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

  ```bash
    $ npm start 
    
    > log-writer@1.0.0 start
    > node index.js
    
    2025-08-05T13:23:10.469Z: 32f4ad5-50e2-4373-99a5-af037858ba55  # <- logs in stdout>
    2025-08-05T13:23:15.476Z: 32f4ad5-50e2-4373-99a5-af037858ba55 # <- logs in stdout>

  ```

  **verify:**

  ```bash
  $ cat ./shared-logs/output.log
    2025-08-05T13:23:10.469Z: 32f4ad5-50e2-4373-99a5-af037858ba55
    2025-08-05T13:23:15.476Z: 32f4ad5-50e2-4373-99a5-af037858ba55
  ```

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/log-writer:1.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/log-writer:1.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/log-writer:1.0](https://hub.docker.com/r/yakovyakov/log-writer/tags?name=1.0)
