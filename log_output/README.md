# Kubernetes Exercise 1.3: Declarative approach

create a new folder named manifests and place a file called [deployment.yaml](./manifest/deployment.yaml)

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

**Apply the deployment with apply command:**

  ```bash
  kubectl apply -f log_output/manifest/deployment.yaml
  ```

## Verification and Monitoring

**View deployments and pods:**

  ```bash
  $ kubectl get deployments
  NAME            READY   UP-TO-DATE   AVAILABLE   AGE
  logoutput-dep   1/1     1            1           7m15s
  
  $ kubectl get pods
  NAME                            READY   STATUS    RESTARTS   AGE
  logoutput-dep-8f85fdd65-k5fdv   1/1     Running   0          7m18s
  ```

**View logs:**

  ```bash
  #kubectl logs -f <pod-name>
  $ kubectl logs -f logoutput-dep-8f85fdd65-k5fdv
  > log-ouput-app@1.0.0 start
  > node index.js

  2025-08-01T17:01:24.987Z: 274bfcc-8a64-43b3-8054-35768ab16896
  2025-08-01T17:01:29.999Z: 274bfcc-8a64-43b3-8054-35768ab16896
  2025-08-01T17:01:35.005Z: 274bfcc-8a64-43b3-8054-35768ab16896
  ```
