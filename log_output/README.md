# Kubernetes Exercise 2.1: Connecting Pods via HTTP

This exercise replaces file-based communication between the `log-output` and `ping-pong` applications with **HTTP-based communication**. The `log-writer` now fetches the ping counter from the `ping-pong` service via HTTP instead of reading it from a shared volume.

## Objective

* Replace shared file storage (`counter.txt`) between `log-output` and `ping-pong` apps with an HTTP call.
* Remove the PersistentVolumeClaim (PVC) from the `log-writer` container.
* Keep persistence in `ping-pong` (via PVC) to survive pod restarts.
* Use a Kubernetes `Service` for internal pod-to-pod communication.

## Components

| Component | Role |
|--------|------|
| `ping-pong` | Increments and persists a counter. Exposes `/pingpong` and `/pings` endpoints. |
| `log-writer` | Generates a UUID and logs it every 5 seconds, including the current ping count fetched via HTTP. |
| `log-reader` | Serves the log file via HTTP (`/logs`, `/status`). |
| `pingpong-svc` | Kubernetes Service exposing `ping-pong` internally. |
| `counter-pvc` | PVC used **only by `ping-pong`** to persist the counter across restarts. |

> 🔁 Communication: `log-writer` → `GET http://pingpong-svc:2345/pings`

## Directory Structure

  ```tree
  .
  ├── apps                                # Applications code
  │   ├── log-output                      # old log-output app, only for historical props
  │   ├── log-writer                      # log-writer app
  │   │   ├── Dockerfile                  # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  │   ├── log-reader                      # log-reader app
  │   │   ├── Dockerfile                  # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  │   ├── ping-pong                       # ping-pong app
  │   │   ├── Dockerfile                  # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  ├── manifests                           # Kubernetes configs
  │   ├── log-output                      # Contains multi-container Pod resources
  │   │   ├── deployment.yaml             # Pod with log-writer + log-reader + shared volumes
  │   │   └── service.yaml                # Expose only the log-reader
  │   ├── ping-pong                       # ping-pong App-specific resources + shared volume
  │   │   ├── deployment.yaml
  │   │   └── service.yaml
  │   ├── storage                         # Storage Configuration
  │   │   ├── persistenvolume.yaml
  │   │   └── persistenvolumeclaim.yaml
  │   └── ingress.yaml                    # A commun Traffic routing
  └── README.md
 
  ```

## Applications

### Log Writer Application

A simple Node.js application that:

* Generates a random string(version 4 UUID) on startup, stores it in memory

* Every 5 seconds, the service queries the GET endpoint at <\pingpong-server>/pings to retrieve the counter value, and write the saved random string and the counter along with an ISO-format timestamp to a log file.

* Configurable log file via environment variable (LOG_FILE_PATH), the default log file is "shared-logs/output.log"

* Configurable pingpong-server via environment variable (PING_SERVER_URL), the default is "http\://localhost" (useful for local development)

Image was pushed to Docker Hub repo: [yakovyakov/log-writer:3.0](https://hub.docker.com/r/yakovyakov/log-writer/tags?name=3.0)

Application: [apps/log-writer](./apps/log-writer/)

### Log Reader Application

A simple Node.js web server that:

* Expose two HTTP GET endpoints:

  * `/logs` : Read a log file and provides the content
  
  * `/status`: Read a log file and provides the last line

* Prints "Server(<\app-name>) started in port ${PORT}" on startup

* Configurable port via environment variable (PORT)

* Configurable log file via environment variable (LOG_FILE_PATH), the default log file is "shared-logs/output.log"

Image was pushed to Docker Hub repo: [yakovyakov/log-reader:2.0](https://hub.docker.com/r/yakovyakov/log-reader/tags?name=2.0)

Application: [apps/log-reader](./apps/log-reader/)

### Ping Pong Application

A simple Node.js web server that:

* Maintains an in-memory request counter

* Expose two HTTP GET endpoints:

  * `/pings`: Returns the current counter as JSON: `{ "pings": <number> }`
  
  * `/pingpong`: return "pong <current_counter>". Increments the counter with each request (start at 0), and save the counter in a file

* Configurable port via environment variable (PORT)

* Configurable counter file via environment variable (COUNTER_FILE_PATH), the default counter file is "shared-data/counter.txt"

Image was pushed to Docker Hub repo: [yakovyakov/pingpong-app:2.1](https://hub.docker.com/r/yakovyakov/pingpong-app/tags?name=2.1)

Application: [apps/ping-pong](./apps/ping-pong/)

## Kubernets Resources

| Resource | Purpose |
|--------|---------|
| [Deployment (pingpong-dep)](./manifests/ping-pong/deployment.yaml) | Runs the `ping-pong` app with counter persistence (PVC) |
| [Deployment (logoutput-dep)](./manifests/log-output/deployment.yaml)  | Runs `log-writer` and `log-reader` (no PVC mounted) |
| [Service (pingpong-svc)](./manifests/ping-pong/service.yaml) | Exposes `ping-pong` on port 2345|
| [Service (logoutput-svc)](./manifests/log-output/service.yaml)| Exposes `log-reader` on port 2345 |
| [PersistentVolume](./manifests/storage/persistentvolume.yaml)  | HostPath volume for persistent counter storage |
| [PersistentVolumeClaim](./manifests/storage/persistentvolumeclaim.yaml) | Claim used by `ping-pong` to persist the counter |
| `Ingress`  | Routes `/pingpong`, `/logs`, and `/status` to services |

> 🔗 Communication: `log-writer` → `GET http://pingpong-svc:2345/pings`

## Diagram

  ```mermaid
    graph TD
      subgraph Kubernetes Cluster
          subgraph Ingress
              I[Ingress Controller]
          end
          subgraph Deployments
          subgraph Ping-pong Deployment
              PP[Ping-pong Pod]
          end
          
        
          subgraph Log-output Deployment
              LO[Log-output Pod]
              subgraph LO[Log-output Pod]
                  LW[Log-writer Container]
                  LR[Log-reader Container]
              end
          end
          end
          subgraph Volumes
              PV[(Persistent Volume<br>Contador)]
              LV[emptyDir Volume<br>Logs]
          end
      end
    
      User[Usuario] -->|GET /pingpong| I
      User -->|GET /logs| I
      User -->|GET /status| I
    
      I -->|GET /pingpong| PP
      I -->|GET /logs| LR
      I -->|GET /status| LR
      LW -.->|GET /pings| PP
      PP -->|Read/Write| PV
      
      LW -->|Write| LV
      LR -->|Read| LV

    
      
    
      class PP,LO pod;
      class LW,LR,PP container;
      class PV,LV storage;
      class I ingress;
      class Legend legend;
  ```

## Initial setup

1. Create cluster (without Traefik):

    ```bash
    k3d cluster delete
    k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2 --k3s-arg "--disable=traefik@server:0"
    ```

2. Install Nginx Ingress Controller:

  ```bash
  kubectl apply -f https://raw.githubusercontent.com/kubernetes ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
  ```
  
### Deployment

Apply all configurations:

  ```bash
  kubectl apply -f manifests/storage      # storage config
  kubectl apply -f manifests/log-output   # multi-container Pod with a log writer and reader 
  kubectl apply -f manifests/ping-pong    # ping-pong configs 
  kubectl apply -f manifests/ingress.yaml # shared ingress
  ```

## Access Applications

* PingPong: `curl http://localhost:8081/pingpong`

* Logs: `curl http://localhost:8081/logs`

* Status: `curl http://localhost:8081/status`

## Verification and Monitoring

  ```bash
  # Check storage
  kubectl get pv,pvc

  # Check pods
  kubectl get pods

  # Test endpoints
  curl http://localhost:8081/pingpong
  curl http://localhost:8081/logs
  curl http://localhost:8081/status
```

### Testing persistence

  ```bash
  ## 🧪 Persistence Testing

  # 1. Get initial counter value
  INITIAL_VALUE=$(curl -s http://localhost:8081/pingpong | awk '{print $2}')
  echo "Initial counter value: $INITIAL_VALUE"

  # 2. Increment counter 3 times
  for i in {1..3}; do
    curl -s http://localhost:8081/pingpong
  done

  # 3. Get current value
  CURRENT_VALUE=$(curl -s http://localhost:8081/pingpong | awk '{print $2}')
  echo "Current counter value: $CURRENT_VALUE"

  # 4. Force delete all application pods
  kubectl delete pods -l app=pingpong
  kubectl delete pods -l app=logoutput

  # 5. Wait for pods to restart (30-60 seconds)
  echo "Waiting for pods to restart..."
  sleep 45

  # 6. Verify new pods are running
  kubectl get pods -l app=pingpong
  kubectl get pods -l app=logoutput

  # 7. Check persisted value
  RESTORED_VALUE=$(curl -s http://localhost:8081/pingpong | awk '{print $2}')
  echo "Restored counter value: $RESTORED_VALUE"

  # 8. Validation
  if [ "$RESTORED_VALUE" -gt "$INITIAL_VALUE" ]; then
    echo "✅ Persistence test PASSED - Counter maintained across pod restarts"
  else
    echo "❌ Persistence test FAILED - Counter was not persisted"
    exit 1
  fi
  ```

  Expected output:

  ```bash
  Initial counter value: 16
  pong 17pong 18pong 19Current counter value: 20
  pod "pingpong-dep-54457bbdfb-27l2h" deleted
  pod "logoutput-dep-76748df497-8c8hx" deleted
  Waiting for pods to restart...
  NAME                            READY   STATUS    RESTARTS   AGE
  pingpong-dep-54457bbdfb-vbd5q   1/1     Running   0          48s
  NAME                             READY   STATUS    RESTARTS   AGE
  logoutput-dep-76748df497-kn2ss   2/2     Running   0          46s
  Restored counter value: 21
  ✅ Persistence test PASSED - Counter maintained across pod restarts
  ```
