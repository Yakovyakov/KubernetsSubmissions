# Kubernetes Exercise 1.8

Switch to using Ingress instead of NodePort to access the project

The solution description is [here](#description-of-the-solution-to-exercise-18)

**Notes:** 

* The deployment name was changed to project-todo-dep

* The manifest folder was renamed to **manifests**

## The project structure

  ```tree
  the_project/
  ├── manifests
  │   ├── deployment.yaml   # deployment config file
  │   ├── ingress.yaml      # ingress config file
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

## Kubernetes

## Description of the solution to exercise 1.6

### Initial setup

Create a cluster with command:

  ```bash
  k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
  ```
  
  Now we have access through port 8081 to our server node (actually all nodes) and 8082 to one of our agent nodes port 30080

### Define a Service Resource

Create a file [service.yaml](./manifests/service.yaml) file into the manifests folder.

The resulting file service.yaml looks like this:

  ```file
  apiVersion: v1
  kind: Service
  metadata:
    name: project-todo-svc
  spec:
    type: ClusterIP
    selector:
      app: project-todo      # This is the app as declared in the deployment.
    ports:
      - name: http
        protocol: TCP
        port: 1234           # This is a port that is available to the cluster, in this case it can be ~ anything
        targetPort: 3004     # This is the target port
  ```

### Define an Ingress Resources

Create a file [ingress.yaml](./manifests/ingress.yaml) file into the mani>

The resulting file ingress.yaml looks like this:

  ```file
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: project-todo-ingress
  spec:
    rules:
    - host: ""
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: project-todo-svc
                port:
                  number: 1234
  ```
### Apply Kubernetes configurations

  ```bash
  kubectl apply -f manifests/deployment.yaml
  kubectl apply -f manifests/service.yaml
  kubectl apply -f manifests/ingress.yaml
  ```

  or

  ```bash
  kubectl apply -f manifests/
  ```

### View Resources (Deployments, Pods, Services and Ingress)

  ```bash
  $ kubectl get deployments
  NAME               READY   UP-TO-DATE   AVAILABLE   AGE
  project-todo-dep   1/1     1            1           20m
  
  $ kubectl get pods
  NAME                              READY   STATUS    RESTARTS   AGE
  project-todo-dep-98d4dc59-8s8jc   1/1     Running   0          20m

  $ kubectl get svc
  NAME               TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
  kubernetes         ClusterIP   10.43.0.1      <none>        443/TCP    43h
  project-todo-svc   ClusterIP   10.43.57.190   <none>        1234/TCP   21m

  $ kubectl get ing
  NAME                   CLASS     HOSTS   ADDRESS                                  PORTS   AGE
  project-todo-ingress   traefik   *       192.168.16.2,192.168.16.3,192.168.16.4   80      21m
  ```

### Connecting from outside of the cluster

The ingress is listening on port 80. As we already opened the port there we can acccess the application in "http\://localhost:8081/"

**verify**

  ```bash
  $ curl http://localhost:8081
  TODO App will be implemented soon

  ```
