# Kubernetes Exercise 1.1

## Log Output Application

This application generates a random string(version 4 UUID) on startup, stores it in memory, and outputs it to stdout every 5 seconds along with an ISO-format timestamp. The output format is exactly:

  ```text
  YYYY-MM-DDTHH:MM:SS.sssZ: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  ```

**Example output:**

  ```text
  2025-07-25T14:30:45.128Z: 7b3e5b91-3c45-4a23-9a8b-12d4e6f8a2c1
  ```

## Running the Application Locally

**Install dependencies:**

  ```bash
  npm install
  ```

**Start the application:**

  ```bash
  npm run start
  ```

## Building the Docker Image

**Build the image:**

  ```bash
  docker build -t <your-dockerhub-username>/log-output-app:1.0 .
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/log-output-app:1.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/log-output-app:1.0](https://hub.docker.com/r/yakovyakov/log-output-app/tags?name=1.0)

## Kubernetes Deployment

**Create deployment:**

  ```bash
  kubectl create deployment logoutput-dep --image=yakovyakov/log-output-app:1.0
  ```

## Verification and Monitoring

**View deployments and pods:**

  ```bash
  $ kubectl get deployments
  NAME            READY   UP-TO-DATE   AVAILABLE   AGE
logoutput-dep   1/1     1            1           58m

  $ kubectl get pods
  NAME                             READY   STATUS    RESTARTS   AGE
logoutput-dep-7f566864db-b7xqm   1/1     Running   0          61m

  ```

**View logs:**

  ```bash
  #kubectl logs -f <pod-name>
  kubectl logs -f logoutput-dep-7f566864db-b7xqm
> log-ouput-app@1.0.0 start
> node index.js

2025-07-31T19:26:37.421Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:26:42.432Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:26:47.436Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:26:52.440Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:26:57.444Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:27:02.448Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:27:07.452Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:27:12.456Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:27:17.460Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:27:22.465Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c
2025-07-31T19:27:27.468Z: ab72cbe-c630-4322-8db0-2c3f0a6d693c

  ```
