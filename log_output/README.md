<!-- markdownlint-disable no-inline-html -->
# Kubernetes Exercise 2.7: Stateful Applications with PostgreSQL

This exercise demonstrates how to run a **PostgreSQL database as a StatefulSet** in Kubernetes and use it to store the ping-pong counter statefully, replacing the previous file-based storage.

## Objective

* Run PostgreSQL as a **StatefulSet** with one replica using `postgresql`

* Store the ping-pong counter in a PostgreSQL database instead of a local file

* Use **Kubernetes Secrets** for secure database credentials

* Ensure the counter persists across pod restarts and crashes

* Maintain backward compatibility with the log-writer service

## Components

| Component | Role |
|--------|------|
| `exercises` namespace | Isolated environment for exercise-related workloads |
| `postgres-ss` StatefulSet | PostgreSQL database with persistent storage |
| `postgres-secret` | Secret containing DB_USER and DB_PASSWORD |
| `postgres-svc` | Headless service for PostgreSQL discover |
| `ping-pong` (v3.0) | Increments and persists a counter. Exposes `/pingpong` and `/pings` endpoints. Updated to use PostgreSQL for counter storage |
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
  |   ├── log-output                      # old log-output app, only for historical props
  │   ├── log-writer                      # log-writer app
  │   │   ├── Dockerfile                  # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  │   ├── log-reader                      # log-reader app
  │   │   ├── Dockerfile                  # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  │   ├── ping-pong                       # ping-pong app (updated for PostgreSQL)
  │   │   ├── Dockerfile                  # Docker file
  │   │   ├── index.js
  │   │   └── package.json
  ├── manifests                           # Kubernetes configs
  │   ├── configmaps                      # ConfigMaps for configuration
  │   │   ├── log-config.yaml             # information.txt + MESSAGE
  │   │   ├── log-writer-config.yaml      # LOG_FILE_PATH, PING_SERVER_URL
  │   │   ├── log-reader-config.yaml      # PORT, LOG_FILE_PATH
  │   │   └── ping-pong-config.yaml       # PORT, COUNTER_FILE_PATH
  │   ├── postgresql                      # PostgreSQL resources
  │   │   ├── secret.yaml                 # Database credentials (DB_USER, DB_PASSWORD)
  │   │   ├── statefulset.yaml            # PostgreSQL StatefulSet
  │   │   └── service.yaml                # Headless service (postgres-svc)
  │   ├── log-output                      # Contains multi-container Pod resources
  │   │   ├── deployment.yaml             # Pod with log-writer + log-reader + shared volumes (empty dir)
  │   │   └── service.yaml                # Expose only the log-reader
  │   ├── ping-pong                       # ping-pong App-specific resources 
  │   │   ├── deployment.yaml             # Updated with DB env from ConfigMap + Secret
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

### Ping Pong Application (v3.0 - Updated)

A simple Node.js web server that now uses PostgreSQL for persistence:

* Maintains a request counter in **PostgreSQL database**
* Expose two HTTP GET endpoints:

  * `/pings`: Returns the current counter as JSON: `{ "pings": <number> }`
  
  * `/pingpong`: return "pong <current_counter>". Increments the counter with each request
* **Database schema** (automatically initialized by PostgreSQL):

    ```sql
    CREATE TABLE IF NOT EXISTS counter (
      id SERIAL PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    );
    ```

* Configuration via environment variables:
  * From ConfigMap: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`

  * From Secret: `DB_USER`, `DB_PASSWORD`

Image was pushed to Docker Hub repo: [yakovyakov/pingpong-app:3.0](https://hub.docker.com/r/yakovyakov/pingpong-app/tags?name=3.0)

Application: [apps/ping-pong](./apps/ping-pong/)

### PostgreSQL Database (StatefulSet)

* PostgreSQL  running as StatefulSet (`postgres-ss`)

* Persistent storage using `volumeClaimTemplates` with `local-path` storage class

* Headless service `postgres-svc` for direct pod discovery

* Automated initialization with database `pingpong`

* Secure credentials via Kubernetes Secret

---

## Kubernets Resources

### PostgreSQL Resources

| Resource | Purpose |
|----------|---------|
| [StatefulSet (postgresql)](./manifests/postgresql/statefulset.yaml) | PostgreSQL with PVC template |
| [Secret (postgresql)](./manifests/postgresql/secret.yaml) | DB credentials (`DB_USER`, `DB_PASSWORD`) |
| [Service (postgresql)](./manifests/postgresql/service.yaml) | Headless service for PostgreSQL |

### Application Resources

| Resource | Purpose |
|----------|---------|
| [Deployment (pingpong-dep)](./manifests/ping-pong/deployment.yaml) | Runs the `ping-pong` app Updated with DB env from ConfigMap + Secret |
| [Deployment (logoutput-dep)](./manifests/log-output/deployment.yaml)  | Runs `log-writer` and `log-reader` (no PVC mounted) |
| [Service (pingpong-svc)](./manifests/ping-pong/service.yaml) | Exposes `ping-pong` on port 2345|
| [Service (logoutput-svc)](./manifests/log-output/service.yaml)| Exposes `log-reader` on port 2345 |

### Configuration Resources

| Resource | Purpose |
|--------|---------|
| [ConfigMap (log-config)](./manifests/configmaps/log-config.yaml) | Stores `information.txt` and `MESSAGE` for `log-writer` |
| [ConfigMap (log-writer-config)](./manifests/configmaps/log-writer-config.yaml) | Configuration: `LOG_FILE_PATH`, `PING_SERVER_URL` |
| [ConfigMap (log-reader-config)](./manifests/configmaps/log-reader-config.yaml) | Configuration: `PORT`, `LOG_FILE_PATH` |
| [ConfigMap (ping-pong-config)](./manifests/configmaps/ping-pong-config.yaml) | Configuration: DB connection settings (host, port, name) |

### Storage & Networking

| Resource | Purpose |
|--------|---------|
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
      subgraph PostgreSQL StatefulSet
        PG[PostgreSQL Pod]
      end
      
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
        PV[(Persistent Volume<br>Database)]
        CM[ConfigMap<br>Information.txt + MESSAGE]
        LV[emptyDir Volume<br>Logs]
      end

      subgraph Secrets
        SEC[Postgres Secret<br>Credentials]
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
  PP -->|Read/Write| PG
  PG -->|Persist| PV
  PP -->|Credentials| SEC
  LW -->|Write| LV
  LR -->|Read| LV

  class PP,LO,PG pod;
  class LW,LR container;
  class PV storage;
  class I ingress;
  class SEC secret;
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

### Apply Kubernetes Resources

  ```bash# Create namespace
  kubectl create namespace exercises || true

  # Apply storage (PV for counter)
  kubectl apply -f manifests/storage/ -n exercises

  # Apply PostgreSQL resources
  kubectl apply -f manifests/postgresql/ -n exercises

  # Apply ConfigMaps
  kubectl apply -f manifests/configmaps/ -n exercises

  # Wait for PostgreSQL to be ready
  kubectl wait --for=condition=ready pod -l app=postgres -n exercises --timeout=120s

  # Apply applications
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

---

## Access Applications

After editing /etc/hosts, you can access:

* PingPong: `curl http://exercises.local:8081/pingpong`

* Logs: `curl http://exercices.local:8081/logs`

* Status: `curl http://exercices.local:8081/status`

## Verification and Monitoring

### 1. Check all resources

  ```bash
  kubectl get pods,statefulsets,deployments,services,secrets,configmaps,pv,pvc -n exercises
  ```

### 2. Verify PostgreSQL StatefulSet

  ```bash
  # Check StatefulSet status
  kubectl get statefulset postgres-ss -n exercises

  # Check PostgreSQL pod
  kubectl get pods -l app=postgres -n exercises

  # Check PVC created by StatefulSet
  kubectl get pvc -n exercises | grep postgres-data
  ```

### 3. Test Database Connectivity

  ```bash
    # Test database connection from ping-pong pod
  kubectl exec -it deployment/pingpong-dep -n exercises -- \
  sh -c 'PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT * FROM counter;"'
  ```

### 4. Test Application Functionality

  ```bash
  # Test ping-pong endpoint (should increment counter in database)
  curl http://exercises.local:8081/pingpong
  curl http://exercises.local:8081/pingpong

  # Check counter via API
  curl http://exercises.local:8081/pings

  # Verify logs contain counter from database
  curl http://exercises.local:8081/status
  ```

### 5. Test Persistence

  ```bash
  # Restart ping-pong pod
  kubectl delete pod -l app=pingpong -n exercises

  # Counter should persist after restart (from database)
  curl http://exercises.local:8081/pings

  # Restart PostgreSQL pod
  kubectl delete pod -l app=postgres -n exercises

  # Wait for restart and check data persistence
  kubectl wait --for=condition=ready pod -l app=postgres -n exercises --timeout=120s
  curl http://exercises.local:8081/pings
  ```

### Expected Output

#### /status Endpoint

```text
file content: this text is from file
env variable: MESSAGE=hello world
2025-08-26T15:48:29.960Z: 10a5d22-47dc-4828-aa28-5b108295a08d
Ping / Pongs: 15
```

#### /pings Endpoint

```json
{"pings": 15}
```

#### /pingpong Endpoint

```text
pong 16
```

---

## Troubleshooting

### Common Issues

* PostgreSQL StatefulSet not ready: Check PVC binding and pod logs

* Connection refused: Verify postgres-svc service exists and endpoints are correct

* Authentication failed: Check secret values and PostgreSQL logs

* Storage issues: Verify local-path storage class is available in k3d

### Debug Commands

```bash
# Check PostgreSQL logs
kubectl logs statefulset/postgres-ss -n exercises

# Check ping-pong logs
kubectl logs deployment/pingpong-dep -n exercises

# Verify service endpoints
kubectl get endpoints postgres-svc -n exercises
kubectl get endpoints pingpong-svc -n exercises

# Check environment variables in ping-pong pod
kubectl exec -it deployment/pingpong-dep -n exercises -- env | grep DB_

# Test database connection manually
kubectl run -it --rm --restart=Never --image postgres:13.0 psql-test -n exercises -- \
  psql postgres://postgres:password@postgres-svc:5432/pingpong -c "SELECT * FROM counter;"
```

## Screenshoots

<img src="../IMG/exercise_2_5.png" alt="Screenshoot exercise 2.5" width="600">
