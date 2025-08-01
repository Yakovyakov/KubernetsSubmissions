# Kubernetes Exercise 1.4: Declarative approach

create a new folder named manifests and place a file called [deployment.yaml](./manifest/deployment.yaml)
**Note:** The deployment name was changed to project-todo-dep

## The project structure

  ```tree
  the_project/
  ├── manifest
  │   └── deployment.yaml # deplyment config file
  ├── README.md
  └── todo_app/
    ├── index.js       # server Node.js code
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
  kubectl apply -f manifest/deployment.yaml
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
