# Kubernetes Exercise 1.5

Make the project respond something to a GET request sent to the / url of the project

The PORT environment variable was added to the container in the [manifest/deployment.yaml](./manifest/deployment.yaml) file.

The deployment was tested with the port-forward command.

The solution description is [here](#description-of-the-solution-to-exercise-15)

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
## Description of the solution to exercise 1.5

### Define an enviroment variable for a container

  ```file
     ...
	containers:
          - name: todo-app
            image: yakovyakov/todo-app:1.0
            env:
              - name: PORT
                value: "3004"
  ```

### List Pod's container enviroment vabriables

  ```bash
    # Pod's name project-todo-dep-98d4dc59-gfmgc
    $ kubectl exec project-todo-dep-98d4dc59-gfmgc -- printenv
    PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    HOSTNAME=project-todo-dep-98d4dc59-gfmgc
    NODE_VERSION=18.20.8
    YARN_VERSION=1.22.22
    PORT=3004  # <-- PORT enviroment variable
    KUBERNETES_SERVICE_PORT_HTTPS=443
    KUBERNETES_PORT=tcp://10.43.0.1:443
    KUBERNETES_PORT_443_TCP=tcp://10.43.0.1:443
    KUBERNETES_PORT_443_TCP_PROTO=tcp
    KUBERNETES_PORT_443_TCP_PORT=443
    KUBERNETES_PORT_443_TCP_ADDR=10.43.0.1
    KUBERNETES_SERVICE_HOST=10.43.0.1
    KUBERNETES_SERVICE_PORT=443
    HOME=/root

  ```
### Connecting from outside of the cluster

  ```bash
  $ kubectl port-forward project-todo-dep-98d4dc59-gfmgc 3006:3004
  Forwarding from 127.0.0.1:3006 -> 3004
  Forwarding from [::1]:3006 -> 3004
  Handling connection for 3006

  ```
  
**verify**

  ```bash
  $ curl http://localhost:3006
  TODO App will be implemented soon

  ```
