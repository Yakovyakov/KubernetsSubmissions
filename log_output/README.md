<!-- markdownlint-disable no-inline-html -->
# Kubernetes Exercise 2.5: Documentation and ConfigMaps

This exercise demonstrates how to use **ConfigMaps** in Kubernetes to inject non-confidential configuration data into the `log-writer` container, including a file and an environment variable.

## Objective

* Create a ConfigMap named `log-config` with:
  * A file: `information.txt` → content: `this text is from file`
  * An environment variable: `MESSAGE=hello world`
* Mount the file as a volume in the `log-writer` container
* Inject the environment variable into the container
* Verify that both values appear in the log output via `/status`## Components

| Component | Role |
|--------|------|
| `exercises` namespace | Isolated environment for exercise-related workloads |
| `ping-pong` | Increments and persists a counter. Exposes `/pingpong` and `/pings` endpoints. |
| `log-writer` | Generates a UUID and logs it every 5 seconds, including the current ping count fetched via HTTP **and ConfigMap data** |
| `log-reader` | Serves the log file via HTTP (`/logs`, `/status`) |
| `pingpong-svc` | Kubernetes Service exposing `ping-pong` internally |
| `counter-pvc` | PVC used **only by `ping-pong`** to persist the counter across restarts |
| `log-config` | ConfigMap with `information.txt` and `MESSAGE` |
| `log-writer-config`, `log-reader-config`, `ping-pong-config` | ConfigMaps for technical configuration (paths, ports, URLs) |

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
  │   ├── configmaps                      # ConfigMaps for configuration
  │   │   ├── log-config.yaml             # information.txt + MESSAGE
  │   │   ├── log-writer-config.yaml      # LOG_FILE_PATH, PING_SERVER_URL
  │   │   ├── log-reader-config.yaml      # PORT, LOG_FILE_PATH
  │   │   └── ping-pong-config.yaml       # PORT, COUNTER_FILE_PATH
  │   ├── log-output                      # Contains multi-container Pod resources
  │   │   ├── deployment.yaml             # Pod with log-writer + log-reader + shared volumes (empty dir)
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

* Generates a random string (version 4 UUID) on startup, stores it in memory
* Every 5 seconds, the service queries the GET endpoint at `<pingpong-server>/pings` to retrieve the counter value
* Writes a structured log entry in **JSON Lines format** (one JSON object per line) containing:
  * Timestamp
  * UUID
  * Content from the ConfigMap file (`information.txt`)
  * Environment variable (`MESSAGE`)
  * Ping counter
* Configurable log file via environment variable (LOG_FILE_PATH), the default log file is "shared-logs/output.log"

* Configurable pingpong-server via environment variable (PING_SERVER_URL), the default is "http\://localhost" (useful for local development)

Image was pushed to Docker Hub repo: [yakovyakov/log-writer:4.0](https://hub.docker.com/r/yakovyakov/log-writer/tags?name=4.0)

Application: [apps/log-writer](./apps/log-writer/)

### Log Reader Application

A simple Node.js web server that:

* Expose two HTTP GET endpoints:

  * `/logs` : Read a log file and provides the content
  
  * `/status`: Read a log file and provides the last line

* Prints "Server(<\app-name>) started in port ${PORT}" on startup

* Configurable port via environment variable (PORT)

* Configurable log file via environment variable (LOG_FILE_PATH), the default log file is "shared-logs/output.log"

Image was pushed to Docker Hub repo: [yakovyakov/log-reader:3.0](https://hub.docker.com/r/yakovyakov/log-reader/tags?name=3.0)

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
| [ConfigMap (log-config)](./manifests/configmaps/log-config.yaml) | Stores `information.txt` and `MESSAGE` for `log-writer` |
| [ConfigMap (log-writer-config)](./manifests/configmaps/log-writer-config.yaml) | Configuration: `LOG_FILE_PATH`, `PING_SERVER_URL` |
| [ConfigMap (log-reader-config)](./manifests/configmaps/log-reader-config.yaml) | Configuration: `PORT`, `LOG_FILE_PATH` |
| [ConfigMap (ping-pong-config)](./manifests/configmaps/ping-pong-config.yaml) | Configuration: `PORT`, `COUNTER_FILE_PATH` |
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
    subgraph "Namespace: exercises"
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
      
      subgraph Volumes
        PV[(Persistent Volume<br>Counter)]
        CM[ConfigMap<br>Information.txt + MESSAGE]
        LV[emptyDir Volume<br>Logs]
      end
    end
  end

  User[User] -->|GET /pingpong| I
  User -->|GET /logs| I
  User -->|GET /status| I

  I -->|/pingpong| PP
  I -->|/logs| LR
  I -->|/status| LR
  LW -.->|GET /pings| PP
  LW -.->|Mounts| CM
  PP -->|Read/Write| PV
  LW -->|Write| LV
  LR -->|Read| LV

  class PP,LO pod;
  class LW,LR container;
  class PV,LV storage;
  class I ingress;
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

### Create the `exercises` namespace

  ```bash
  kubectl create namespace exercises || true
  ```

### Apply ConfigMaps

```bash
kubectl apply -f manifests/configmaps/ -n exercises
```

### Deploy All

Apply all configurations:

  ```bash
kubectl apply -f manifests/storage/ -n exercises
kubectl apply -f manifests/ping-pong/ -n exercises
kubectl apply -f manifests/log-output/ -n exercises
kubectl apply -f manifests/ingress.yaml -n exercises
```

> ⚠️ Note:<br>
> Although the YAML has namespace: exercises, it is still good practice to use -n exercises for consistency.<br>
> The `PersistentVolume` (PV) is cluster-scoped and does not use namespaces.  
> The `-n exercises` flag is ignored for `persistentvolume.yaml`, but it is required for `persistentvolumeclaim.yaml`.  
> This command works because Kubernetes safely ignores the namespace for cluster-scoped resources.

### Configure local DNS

Add this line to `/etc/hosts` :

```text
127.0.0.1 exercises.local
```

## Access Applications

After editing /etc/hosts, you can access:

* PingPong: `curl http://exercises.local:8081/pingpong`

* Logs: `curl http://exercices.local:8081/logs`

* Status: `curl http://exercices.local:8081/status`

## Verification and Monitoring

1. Check resources

    ```bash
    kubectl get pods,pv,pvc,services,configmaps -n exercises
    ```

2. Check ConfigMap

    ```bash
    kubectl get configmap log-config -n exercises -o yaml
    kubectl get configmap log-reader-config -n exercises -o yaml
    kubectl get configmap log-writer-config -n exercises -o yaml
    kubectl get configmap ping-pong-config -n exercises -o yaml
    ```

3. Check /status output

    ```bash
    curl http://exercises.local:8081/status
    ```

    Should show:

    ```text
    file content: this text is from file
    env variable: MESSAGE=hello world
    2025-08-26T15:48:29.960Z: 10a5d22-47dc-4828-aa28-5b108295a08d
    Ping/Pongs: 0
    ```

## Screenshoots

<img src="../IMG/exercise_2_5.png" alt="Screenshoot exercise 2.5" width="600">
