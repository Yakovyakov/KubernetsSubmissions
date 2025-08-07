# Log Output Application

A simple Node.js web server that:

* Generates a random string(version 4 UUID) on startup, stores it in memory

* Prints "Server started in port ${PORT}" on startup

* Has an endpoint (/status) to request current status. Responds with a json message with the following format

  ```json
  {
    "timestamp": "YYYY-MM-DDTHH:MM:SS.sssZ",
    "randomString": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
  }
  ```

* Outputs the saved random string to stdout every 5 seconds along with an ISO-format timestamp. The output format for the logs is exactly:

  ```text
  YYYY-MM-DDTHH:MM:SS.sssZ: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  ```

  **Example output:**

    ```text
    2025-07-25T14:30:45.128Z: 7b3e5b91-3c45-4a23-9a8b-12d4e6f8a2c1
    ```

* Configurable port via environment variable (PORT)

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

    > log-ouput-app@1.0.0 start
    > node index.js

    Server started on port 8080
    2025-08-05T13:23:10.469Z: 32f4ad5-50e2-4373-99a5-af037858ba55  # <- logs in stdout>
    2025-08-05T13:23:15.476Z: 32f4ad5-50e2-4373-99a5-af037858ba55 # <- logs in stdout>

  ```

  **verify:**

  ```bash
  $ curl http://localhost:8080/status
  {"timestamp":"2025-08-05T13:23:47.958Z","randomString":"32f4ad5-50e2-4373-99a5-af037858ba55"}
  ```

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/log-output-app:2.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/log-output-app:2.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/log-output-app:2.0](https://hub.docker.com/r/yakovyakov/log-output-app/tags?name=2.0)
