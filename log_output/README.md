# Kubernetes Exercise 1.7

**Notes:**

* The version of the log-output-app was changed to 2.0

* The manifest folder was renamed to **manifests**

## Log Output Application

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

### Verify the Application Locally

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

## Kubernetes

We need to configure 3 main resources:

1. Deployment ([deployment.yaml](./manifests/deployment.yaml))
2. Service ([service.yaml](./manifests/service.yaml))
3. Ingress ([ingress.yaml](./manifests/ingress.yaml))

### Apply Kubernets configurations

  ```bash
  kubectl apply -f manifests/deployment.yaml
  kubectl apply -f manifests/service.yaml
  kubectl apply -f manifests/ingress.yaml
  ```

  or

  ```bash
  kubectl apply -f manifests/
  ```

## Verification and Monitoring

### View deployments, pods, services and ingress

  ```bash
  $ kubectl get deployments
  NAME            READY   UP-TO-DATE   AVAILABLE   AGE
  logoutput-dep   1/1     1            1           7m15s
  
  $ kubectl get pods
  NAME                            READY   STATUS    RESTARTS   AGE
  logoutput-dep-7545bd587d-dc4qk   1/1     Running   0          46m

  $ kubectl get svc
  NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
  kubernetes      ClusterIP   10.43.0.1       <none>        443/TCP    21h
  logoutput-svc   ClusterIP   10.43.112.236   <none>        2345/TCP   16m  

  $ kubectl get ing
  NAME                CLASS     HOSTS   ADDRESS                                  PORTS   AGE
  logoutput-ingress   traefik   *       192.168.16.2,192.168.16.3,192.168.16.4   80      36m
  ```

### View logs from stdout

  ```bash
  #kubectl logs -f <pod-name>
  $ kubectl logs -f logoutput-dep-7545bd587d-dc4qk
  > log-ouput-app@1.0.0 start
  > node index.js

  Server started on port 8080
  2025-08-05T15:20:20.081Z: aa332e3-3de9-4891-814b-61fa57a1f1ad # < --- logs to stdout
  2025-08-05T15:20:25.084Z: aa332e3-3de9-4891-814b-61fa57a1f1ad
  2025-08-05T15:20:30.085Z: aa332e3-3de9-4891-814b-61fa57a1f1ad
  ```

### Connecting from outside of the cluster

The ingress is listening on port 80. As we already opened the port there we can acccess the application's enpoint on "http\://localhost:8081/status"

  ```bash
  curl http://localhost:8081/status
  {"timestamp":"2025-08-05T16:19:28.092Z","randomString":"aa332e3-3de9-4891-814b-61fa57a1f1ad"}
  ```
