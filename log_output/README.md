# Kubernetes Exercise 1.10

**Notes:**

* Split the Log Output application into two diferent containers within a single pod

* Create a log-writer application

* Create a log-reader application

* The manifest folder was renamed to **manifests**

## Directory Structure

  ```tree
  .
  ├── apps                      # Applications code
  │   ├── log-output            # old log-output app, only for historical props
  │   ├── log-writer            # log-writer app
  │   │   ├── Dockerfile        # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  │   ├── log-reader            # log-reader app
  │   │   ├── Dockerfile        # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  │   ├── ping-pong             # ping-pong app
  │   │   ├── Dockerfile        # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  ├── manifests                 # Kubernetes configs
  │   ├── log-output            # Contains multi-container Pod resources
  │   │   ├── deployment.yaml   # Pod with log-writer + log-reader + shared volumen
  │   │   └── service.yaml      # Expose only the log-reader
  │   ├── ping-pong             # ping-pong App-specific resources
  │   │   ├── deployment.yaml
  │   │   └── service.yaml
  │   └── ingress.yaml          # A commun Traffic routing
  └── README.md
 
  ```

## Applications

### Log Writer Application

A simple Node.js application that:

* Generates a random string(version 4 UUID) on startup, stores it in memory

 
* Every 5 seconds, it reads the counter saved in file (COUNTER_FILE), and write the saved random string and the counter along with an ISO-format timestamp to a log file.

* Configurable log file via environment variable (LOG_FILE_PATH), the default log file is "shared-logs/output.log"

* Configurable counter file via environment variable (COUNTER_FILE_PATH), the default counter file is "shared-data/counter.txt"

Image was pushed to Docker Hub repo: [yakovyakov/log-writer:2.0](https://hub.docker.com/r/yakovyakov/log-writer/tags?name=2.0)

Application: [apps/log-writer](./apps/log-writer/)

### Log Reader Application

A simple Node.js web server that:

* Expose two HTTP GET endpoints:

  * /logs : Read a log file and provides the content
  
  * /status: Read a log file and provides the last line

* Prints "Server(<\app-name>) started in port ${PORT}" on startup

* Configurable port via environment variable (PORT)

* Configurable log file via environment variable (LOG_FILE_PATH), the default log file is "shared-logs/output.log"

Image was pushed to Docker Hub repo: [yakovyakov/log-reader:2.0](https://hub.docker.com/r/yakovyakov/log-reader/tags?name=2.0)

Application: [apps/log-reader](./apps/log-reader/)

### Ping Pong Application

A simple Node.js web server that:

* Maintains an in-memory request counter

* Expose a GET /pingpong endpoint that return "pong <current_counter>"

* Increments the counter with each request (start at 0), and save the counter in a file

* Configurable port via environment variable (PORT)

* Configurable counter file via environment variable (COUNTER_FILE_PATH), the default counter file is "shared-data/counter.txt"

Image was pushed to Docker Hub repo: [yakovyakov/pingpong-app:2.0](https://hub.docker.com/r/yakovyakov/pingpong-app/tags?name=2.0)

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
### Diagram 

  graph TD
      subgraph Kubernetes Cluster
          subgraph Ingress
              I[Ingress Controller]
          end
         
          subgraph Ping-pong Deployment
              PP[Ping-pong Pod]
          end
        
          subgraph Log-output Deployment
              LO[Log-output Pod]
              subgraph LO
                  LW[Log-writer Container]
                  LR[Log-reader Container]
              end
          end
        
          subgraph Volumes
              PV[Persistent Volume<br>Contador]
              LV[emptyDir Volume<br>Logs]
          end
      end
    
      User[Usuario] -->|GET /pingpong| I
      User -->|GET /| I
      User -->|GET /currentstatus| I
    
      I -->|/pingpong| PP
      I -->|/| LR
      I -->|/currentstatus| LR
    
      PP -->|Lee/Escribe| PV
      LW -->|Lee| PV
      LW -->|Escribe| LV
      LR -->|Lee| LV
    
      %% Endpoints específicos
      style LR fill:#fff2cc,stroke:#333,stroke-width:2px
      style I fill:#c9daf8,stroke:#333,stroke-width:2px
    
      %% Leyenda
      Legend[<
          <b>Endpoints Log-reader:</b><br/>
          • / → Muestra todo el contenido del log<br/>
          • /currentstatus → Muestra solo la última línea<br/>
          • /health → Health check
      >]
    
      classDef pod fill:#e6f7ff,stroke:#333,stroke-width:2px;
      classDef container fill:#fff,stroke:#333,stroke-width:1px;
      classDef storage fill:#d9ead3,stroke:#333,stroke-width:1px;
      classDef ingress fill:#c9daf8,stroke:#333,stroke-width:2px;
      classDef legend fill:#f9f9f9,stroke:#ddd,stroke-width:1px;
    
      class PP,LO pod;
      class LW,LR container;
      class PV,LV storage;
      class I ingress;
      class Legend legend;
    ```
### Kubernets Resources

#### Applications Resources (in manifests/\<app-name>)

We need to configure the followings resources:

1. Deployment:

    * log-output:  [deployment.yaml](./manifests/log-output/deployment.yaml).

    * Resources to deploy a multi-container Pod with a log writer and reader. Pod structe:
      * log-reader Container that uses a volume mount (/usr/src/app/shared-logs)
      * log-writer Container that uses a volume mount (/usr/src/app/shared-logs)
      * Shared Volume:
        * emptyDir: Temporary storage shared between containers in a same Pod

    * ping-pong: [deployment.yaml](./manifests/ping-pong/deployment.yaml)

2. Service:

    * log-output: [service.yaml](./manifests/log-output/service.yaml)
      * Expose only the log-reader container.
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
          - path: /logs # change endpoint /status for /logs
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
  kubectl apply -f manifests/log-output   # multi-container Pod with a log writer and reader 
  kubectl apply -f manifests/ping-pong    # ping-pong configs 
  kubectl apply -f manifests/ingress.yaml # shared ingress
  ```

### Verification and Monitoring

#### View deployments, pods, services and ingress

  ```bash
  $ kubectl get deployments
  NAME            READY   UP-TO-DATE   AVAILABLE   AGE
  logoutput-dep   1/1     1            1           97s
  pingpong-dep    0/1     1            0           9m52s


  $ kubectl get pods
  NAME                             READY   STATUS             RESTARTS        AGE
  debug                            1/1     Running            1 (2d17h ago)   4d16h
  logoutput-dep-77df89f9c6-8p78n   2/2     Running            0               2m7s
  pingpong-dep-5969cc986f-h7znj    0/1     ImagePullBackOff   0               10m

  
  $ kubectl get svc
  NAME            TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
  kubernetes      ClusterIP   10.43.0.1      <none>        443/TCP    2d20h
  logoutput-svc   ClusterIP   10.43.142.78   <none>        2345/TCP   158m
  pingpong-svc    ClusterIP   10.43.98.68    <none>        2345/TCP   3h39m

  $ kubectl get ing
  NAME            TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
  kubernetes      ClusterIP   10.43.0.1      <none>        443/TCP    6d18h
  logoutput-svc   ClusterIP   10.43.53.206   <none>        2345/TCP   10m
  pingpong-svc    ClusterIP   10.43.16.115   <none>        2345/TCP   10m

  ```
  
#### View multi-container Pod

  Applications (log-writer and log-reader) are running in a same Pod (logoutput-dep-77df89f9c6-8p78n) as we can see:
  
  ```bash
  Name:             logoutput-dep-77df89f9c6-8p78n
  Namespace:        default
  Priority:         0
  Service Account:  default
  Node:             k3d-k3s-default-agent-1/192.168.16.4
  Start Time:       Mon, 11 Aug 2025 09:26:49 -0400
  Labels:           app=logoutput
                  pod-template-hash=77df89f9c6
  Annotations:      <none>
  Status:           Running
  IP:               10.42.2.15
  IPs:
    IP:           10.42.2.15
  Controlled By:  ReplicaSet/logoutput-dep-77df89f9c6
  Containers:
    log-writer:
      Container ID:   containerd://8a0589d09135db4172c50ecd7d2d9cc95f78cac1c891514e8eb94f9ad81325b5
      Image:          yakovyakov/log-writer:1.0
      Image ID:       docker.io/yakovyakov/log-writer@sha256:a2ecd54149e895322f6ab6443ef229212c8893369e5b656438ed12b9d7506184
      Port:           <none>
      Host Port:      <none>
      State:          Running
        Started:      Mon, 11 Aug 2025 09:27:36 -0400
      Ready:          True
      Restart Count:  0
      Environment:    <none>
      Mounts:
        /usr/src/app/shared-logs from shared-logs (rw)
        /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-frml7 (ro)
    log-reader:
      Container ID:   containerd://fc1fa5ce1abbcda5b043f229e20995b73c800a3f58c5b03c53461e299389fc02
      Image:          yakovyakov/log-reader:1.0
      Image ID:       docker.io/yakovyakov/log-reader@sha256:5d948af84788c2d41d40cabbc78ffd2b96fcf9e6cb8407b8d3c2d083b7864741
      Port:           <none>
      Host Port:      <none>
      State:          Running
        Started:      Mon, 11 Aug 2025 09:27:58 -0400
      Ready:          True
      Restart Count:  0
      Environment:
        PORT:  3001
      Mounts:
        /usr/src/app/shared-logs from shared-logs (rw)
        /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-frml7 (ro)
  Conditions:
    Type                        Status
    PodReadyToStartContainers   True 
    Initialized                 True 
    Ready                       True 
  ContainersReady             True 
  PodScheduled                True 
  Volumes:
    shared-logs:
      Type:       EmptyDir (a temporary directory that shares a pod's lifetime)
      Medium:     
      SizeLimit:  <unset>
    kube-api-access-frml7:
      Type:                    Projected (a volume that contains injected data from multiple sources)
      TokenExpirationSeconds:  3607
      ConfigMapName:           kube-root-ca.crt
      Optional:                false
      DownwardAPI:             true
  QoS Class:                   BestEffort
  Node-Selectors:              <none>
  Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                               node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
  Events:
    Type    Reason     Age    From               Message
    ----    ------     ----   ----               -------
    Normal  Scheduled  5m8s   default-scheduler  Successfully assigned default/logoutput-dep-77df89f9c6-8p78n to k3d-k3s-default-agent-1
    Normal  Pulling    5m7s   kubelet            Pulling image "yakovyakov/log-writer:1.0"
    Normal  Pulled     4m23s  kubelet            Successfully pulled image "yakovyakov/log-writer:1.0" in 43.794s (43.794s including waiting). Image size: 59040899 bytes.
    Normal  Created    4m22s  kubelet            Created container log-writer
    Normal  Started    4m22s  kubelet            Started container log-writer
    Normal  Pulling    4m22s  kubelet            Pulling image "yakovyakov/log-reader:1.0"
    Normal  Pulled     4m     kubelet            Successfully pulled image "yakovyakov/log-reader:1.0" in 19.475s (19.475s including waiting). Image size: 60497323 bytes.
    Normal  Created    4m     kubelet            Created container log-reader
    Normal  Started    4m     kubelet            Started container log-reader
  ```

#### View logs from stdout

  ```bash
  #kubectl logs -f <pod-name>
  $ kubectl logs -f logoutput-dep-77df89f9c6-8p78n
  Defaulted container "log-writer" out of: log-writer, log-reader

  > log-writer@1.0.0 start
  > node index.js
  ```

### Connecting from outside of the cluster

The ingress is listening on port 80. As we already opened the port there we can acccess the applications enpoints on:

* log-output: "http\://localhost:8081/logs"

  ```bash
  curl http://localhost:8081/logs
  2025-08-11T13:27:40.687Z: 6a704db-2942-4645-a248-0b999029dd08
  2025-08-11T13:27:45.692Z: 6a704db-2942-4645-a248-0b999029dd08
  2025-08-11T13:27:50.696Z: 6a704db-2942-4645-a248-0b999029dd08
  2025-08-11T13:27:57.594Z: 6a704db-2942-4645-a248-0b999029dd08
  2025-08-11T13:28:02.598Z: 6a704db-2942-4645-a248-0b999029dd08
  2025-08-11T13:28:07.602Z: 6a704db-2942-4645-a248-0b999029dd08
  2025-08-11T13:28:12.606Z: 6a704db-2942-4645-a248-0b999029dd08
  2025-08-11T13:28:17.610Z: 6a704db-2942-4645-a248-0b999029dd08
  ```
* ping-pong: "http\://localhost:8081/pingpong"

  ```bash
  $ curl http://localhost:8081/pingpong 
  pong 1

  $ curl http://localhost:8081/pingpong 
  pong 2

  ```
