# Kubernetes Exercise 1.9

**Notes:**

* The version of the log-output-app was changed to 2.0

* Create a ping-pong application

* The manifest folder was renamed to **manifests**

## Directory Structure

  ```tree
  .
  ├── apps                      # Applications code
  │   ├── log-output            # log-output app
  │   │   ├── Dockerfile        # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  │   ├── ping-pong             # ping-pong app
  │   │   ├── Dockerfile        # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  ├── manifests                 # Kubernetes configs
  │   ├── log-output            # log-output App-specific resources
  │   │   ├── deployment.yaml
  │   │   └── service.yaml
  │   ├── ping-pong             # ping-pong App-specific resources
  │   │   ├── deployment.yaml
  │   │   └── service.yaml
  │   └── ingress.yaml          # A commun Traffic routing
  └── README.md
 
  ```

## Applications

### Log Output Application

A simple Node.js web server that:

* Generates a random string(version 4 UUID) on startup, stores it in memory

* Prints "Server started in port ${PORT}" on startup

* Has an endpoint (/status) to request current status.

* Outputs the saved random string to stdout every 5 seconds along with an ISO-format timestamp.

* Configurable port via environment variable (PORT)

Image was pushed to Docker Hub repo: [yakovyakov/log-output-app:2.0](https://hub.docker.com/r/yakovyakov/log-output-app/tags?name=2.0)

Application: [apps/log-output](./apps/log-output/)

### Ping Pong Application

A simple Node.js web server that:

* Maintains an in-memory request counter

* Expose a GET /pingpong endpoint that return "pong <current_counter>"

* Increments the counter with each request (start at 0)

* Configurable port via environment variable (PORT)

Image was pushed to Docker Hub repo: [yakovyakov/pingpong-app:1.0](https://hub.docker.com/r/yakovyakov/pingpong-app/tags?name=1.0)

Application: [apps/ping-pong](./apps/ping-pong/)

## Kubernetes

### Initial setup

Since we'll use **ingress-nginx**, we need ot disable or remove **Traefik** (pre-installed in k3d)

1. Option A: Recreate the Cluster

    ```bash
    k3d cluster delete # Delete a default cluster

    k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2 --k3s=arg "--disable=traefik@serv:0" # Disable Traefik
    ```

2. Option B: Manually Remove Traefik

    ```bash
    kubectl delete -n kube-system deploy traefik

    kubectl delete -n kube-system svc traefik
    ```

### Install Nginx Ingress Controller

Deploy the official ingress-nginx using **kubectl**

  ```bash
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/provider/cloud/deploy.yaml
  ```

Verify installation:

  ```bash
  kubectl get pods -n ingress-nginx
  ```

Expected ouput

  ```text
  NAME                                        READY   STATUS    RESTARTS   AGE
  ingress-nginx-controller-6d45bc7765-qnptz   1/1     Running   0          179m

  ```

### Kubernets Resources

#### Applications Resources (in manifests/\<app-name>)

We need to configure 3 main resources:

* Deployment:
  * log-output:  [deployment.yaml](./manifests/log-output/deployment.yaml)
  * ping-pong: [deployment.yaml](./manifests/ping-pong/deployment.yaml)
* Service:
  * log-output: [service.yaml](./manifests/log-output/service.yaml)
  * ping-pong: [service.yaml](./manifests/ping-pong/service.yaml)

#### Kubernets Ingress Configuration with NGINX

The [ingress.yaml](./manifests/ingress.yaml) file configures a shared Nginx Ingress Controller to route traffic to both applications:

  ```file
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: shared-ingress
  spec:
    ingressClassName: nginx
    rules:
    - host: ""
      http:
        paths:
          - path: /status
            pathType: Prefix
            backend:
              service:
                name: logoutput-svc
                port:
                  number: 2345
          - path: /pingpong
            pathType: Prefix
            backend:
              service:
                name: pingpong-svc
                port:
                  number: 2345
  ```

### Apply Kubernets configurations

  ```bash
  kubectl apply -f manifests/log-output   # logoutput configs 
  kubectl apply -f manifests/ping-pong    # ping-pong configs 
  kubectl apply -f manifests/ingress.yaml # shared ingress
  ```

### Verification and Monitoring

#### View deployments, pods, services and ingress

  ```bash
  $ kubectl get deployments
  NAME            READY   UP-TO-DATE   AVAILABLE   AGE
  logoutput-dep   1/1     1            1           157m
  pingpong-dep    1/1     1            1           3h38m

  $ kubectl get pods
  NAME                            READY   STATUS    RESTARTS   AGE
  debug                           1/1     Running   0          18h
  logoutput-dep-777c4447-7snk5    1/1     Running   0          158m
  pingpong-dep-5969cc986f-88qtb   1/1     Running   0          3h38m
  
  $ kubectl get svc
  NAME            TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
  kubernetes      ClusterIP   10.43.0.1      <none>        443/TCP    2d20h
  logoutput-svc   ClusterIP   10.43.142.78   <none>        2345/TCP   158m
  pingpong-svc    ClusterIP   10.43.98.68    <none>        2345/TCP   3h39m

  $ kubectl get ing
  NAME             CLASS   HOSTS   ADDRESS        PORTS   AGE
  shared-ingress   nginx   *       192.168.16.3   80      3h32m
  ```

#### View logs from stdout

  ```bash
  #kubectl logs -f <pod-name>
  $ kubectl logs -f logoutput-dep-777c4447-7snk5
  > log-ouput-app@1.0.0 start
  > node index.js

  Server started on port 3001
  2025-08-07T12:50:01.586Z: 597cb94-8a0e-465e-9b72-a0f5b78c6029
  2025-08-07T12:50:06.589Z: 597cb94-8a0e-465e-9b72-a0f5b78c6029
  ```

### Connecting from outside of the cluster

The ingress is listening on port 80. As we already opened the port there we can acccess the applications enpoints on:

* log-output: "http\://localhost:8081/status"

  ```bash
  curl http://localhost:8081/status
  {"timestamp":"2025-08-07T15:32:02.457Z","randomString":"597cb94-8a0e-465e-9b72-a0f5b78c6029"}  ```
* ping-pong: "http\://localhost:8081/pingpong"

  ```bash
  $ curl http://localhostg8081/pingpong 
  pong 1

  $ curl http://localhostg8081/pingpong 
  pong 2

  ```
