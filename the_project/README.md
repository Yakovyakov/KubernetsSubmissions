# Kubernetes Exercise 1.6

Use a NodePort Service to enable access to the project.

The solution description is [here](#description-of-the-solution-to-exercise-16)

**Notes:** 

* The deployment name was changed to project-todo-dep

* The manifest folder was renamed to **manifests**

## The project structure

  ```tree
  the_project/
  ├── manifests
  │   ├── deployment.yaml   # deployment config file
  │   └── service.yaml      # Service config file
  ├── README.md
  └── todo_app/
      ├── index.js        # server Node.js code
      ├── package.json    # package config
      └── Dockerfile      # Docker file
  ```

## TODO App - Node.js Server

A simple Node.js web server that:

* Prints "Server started in port ${PORT}" on startup

* Responds with a placeholder message ("TODO App coming soon")

* Configurable port via environment variable (PORT)

### Running the Application Locally

**Install dependencies:**

  ```bash
  npm install
  ```

**Start the application:**

  ```bash
  npm run start
  ```

### Verify the Application Locally

* Execute in a defafult port:

    ```bash
      $ npm run start
      > todo-app@1.0.0 start
      > node index.js
      
      Server started in port 3000

  ```

  **verify:**

  ```bash
  $ curl http://localhost:3000
  TODO App will be implemented soon
  ```

* Execute in another port(5656):

    ```bash
      $ PORT=5656 npm run start
      > todo-app@1.0.0 start
      > node index.js
      
      Server started in port 5656

  ```

  **verify:**

  ```bash
  $ curl http://localhost:5656
  TODO App will be implemented soon
  ```

## Building the Docker Image (todo-app)

**Build the image:**

  ```bash
  # from the_project path
  docker build -t <your-dockerhub-username>/todo-app:1.0 todo-app/
  ```

## Pushing to Docker Hub

**Log in to Docker Hub:**

  ```bash
  docker login
  ```

**Push the image:**

  ```bash
  docker push <your-dockerhub-username>/todo-app:1.0
  ```

Image was pushed to Docker Hub repo: [yakovyakov/todo-app:1.0](https://hub.docker.com/r/yakovyakov/todo-app/tags?name=1.0)

## Kubernetes Deployment

**Apply the deployment with apply command:**

  ```bash
  # the_project folder
  kubectl apply -f manifests/deployment.yaml
  ```

## Verification and Monitoring

**View deployments and pods:**

  ```bash
  $ kubectl get deployments
  NAME               READY   UP-TO-DATE   AVAILABLE   AGE
  project-todo-dep   1/1     1            1           57s

  $ kubectl get pods
  NAME                               READY   STATUS    RESTARTS   AGE
  project-todo-dep-d9f585669-9rtvd   1/1     Running   0          59s
  ```

**View logs:**

  ```bash
  #kubectl logs -f <pod-name>
  $ kubectl logs -f project-todo-dep-d9f585669-9rtvd

  > todo-app@1.0.0 start
  > node index.js

  Server started in port 3000

  ```
## Description of the solution to exercise 1.6

### Initial setup

Create a cluster with command:

  ```bash
  k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
  ```
  
  Now we have access through port 8081 to our server node (actually all nodes) and 8082 to one of our agent nodes port 30080

### Define a Service Resource

Create a file [service.yaml](./manifests/service.yaml) file into the manifests folder. We need the service to do the following things:

1. Declare that we want a Service

2. Declare which port to listen to

3. Declare the application where the request should be directed to

4. Declare the port where the request should be directed to

The resulting file service.yaml looks like this:

  ```file
  apiVersion: v1
  kind: Service
  metadata:
    name: project-todo-svc
  spec:
    type: NodePort
    selector:
      app: project-todo # This is the app as declared in the deployment.
    ports:
      - name: http
        nodePort: 30080 # This is the port that is available outside. Value for nodePort can be between 30000-32767
        protocol: TCP
        port: 1234 # This is a port that is available to the cluster, in this case it can be ~ anything
        targetPort: 3004 # This is the target port
  ```

### Apply deployment and service

**Apply deployment**

  ```bash
  # the_project folder
  kubectl apply -f manifests/deployment.yaml
  ```
**Apply service**

  ```bash
  # the_project folder
  kubectl apply -f manifests/service.yaml
  ```
  
### Connecting from outside of the cluster

As we've published 8082 as 30080 we can access it now via http://localhost:8082.

**verify**

  ```bash
  $ curl http://localhost:8082
  TODO App will be implemented soon

  ```
