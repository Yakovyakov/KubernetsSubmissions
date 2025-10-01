<!-- markdownlint-disable no-inline-html -->
# Kubernetes Exercise 2.10: Request Logging and Input Validation

This exercise adds **request logging** to the `todo-backend` service and enforces a **140-character limit** on todo text. Invalid requests (empty or too long) are rejected with a `400 Bad Request` response and logged clearly for monitoring.

## Objective

* Log every `POST /todos` request attempt (valid or invalid) to stdout.
* Validate that the `text` field is present and ≤140 characters.
* Return clear error messages for invalid inputs.
* Ensure logs can be viewed with `kubectl logs` (simulating Grafana visibility).

## Components

| Component | Role |
|--------|------|
| `project` namespace | Isolated environment for the project |
| `wikipedia-todo-cronjob` | CronJob that runs hourly |
| `wikipedia-todo-script` | ConfigMap containing the bash script |
| `postgres-ss` StatefulSet | PostgreSQL database for todo storage |
| `postgres-secret` | Secret containing database credentials |
| `postgres-svc` | Headless service for PostgreSQL |
| `todo-frontend` | React SPA served via Nginx |
| `todo-backend` | REST API: `GET /todos`, `POST /todos` (Updated to use PostgreSQL for todo persistence) |
| `image-service` | Fetches and caches a random image from `picsum.photos` |
| `image-cache-pvc` | PersistentVolumeClaim for storing the cached image |
| `project.local` | Custom domain for accessing the project |
| `todo-backend-config` | ConfigMap: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME` |
| `image-service-config` | ConfigMap: `PORT`, `IMAGE_DIR`, `REFRESH_INTERVAL`, `API_IMAGE_URL` |
| `todo-frontend-config` | ConfigMap: reserved for future frontend configuration |

> Communication:
>
> * Frontend → `POST/GET /api/todo-service/todos` → todo-backend → PostgreSQL
> * Frontend → `GET /api/image-service/random-image`
> * `todo-backend` stores todos in PostgreSQL database
>
> 🔁 Workflow: CronJob → Wikipedia API → todo-backend → PostgreSQL

## The project structure

  ```tree
  the_project/
  ├── manifests/
  │   ├── configmaps/
  │   │   ├── cronjob-config.yaml           # NEW: CronJob configmaps
  │   │   ├── todo-backend-config.yaml    
  │   │   ├── image-service-config.yaml
  │   │   └── todo-frontend-config.yaml
  │   ├── storage/
  │   │   ├── persistentvolume.yaml
  │   │   └── persistentvolumeclaim.yaml
  │   ├── apps/
  │   │   ├── cronjob/                      # NEW: CronJob resources
  │   │   │   ├── cronjob.yaml
  │   │   ├── postgresql/                 
  │   │   │   ├── secret.yaml
  │   │   │   ├── statefulset.yaml
  │   │   │   └── service.yaml
  │   │   ├── image-service/
  │   │   │   ├── deployment.yaml
  │   │   │   └── service.yaml
  │   │   └── todo-frontend/
  │   │   │   ├── deployment.yaml
  │   │   │   └── service.yaml
  │   │   └── todo-backend/
  │   │       ├── deployment.yaml         
  │   │       └── service.yaml
  │   └── ingress.yaml
  ├── services/
  │   ├── image-service
  │   │   ├── Dockerfile
  │   │   ├── index.js
  │   │   ├── package.json
  │   │   └── README.md
  │   ├── todo-backend
  │   │   ├── Dockerfile
  │   │   ├── index.js
  │   │   ├── package.json
  │   │   └── README.md
  |   └── todo-frontend
  │       └── src/
  │           ├── App.jsx
  │           └── main.jsx
  └── README.md  
  ```
  
## Application Overview

### Wikipedia Todo CronJob (NEW)

A Kubernetes CronJob that uses a ConfigMap-stored script to:

* **Runs every hour** at minute 0

* **Fetches a random Wikipedia article** using `https://en.wikipedia.org/wiki/Special:Random`

* **Extracts the final URL** from the redirect headers

* **Creates a new todo** via the todo-backend API

* **Handles URL truncation** to fit within 140-character limit

* **Includes comprehensive error handling** and logging

### Frontend (React + Nginx)

* A static SPA built with React.
* Served via Nginx in a Docker container.
* Displays the cached image by calling `/api/image-service/random-image`.
* Uses SPA routing (fallback to index.html for all routes).
* Fetches and displays todos from todo-backend via `/api/todo-service/todos`.
* Sends new todos via POST `/api/todo-service/todos`.
* Uses SPA routing (fallback to index.html for all routes).
* Uses **relative paths** → no hard-coded backend URLs.
* Future-ready: todo-frontend-config ConfigMap created for potential  environment-specific settings.

Image was pushed to Docker Hub repo: [yakovyakov/todo-frontend:
2.0](https://hub.docker.com/r/yakovyakov/todo-frontend/tags?name=2.0)

Application: [services/todo-frontend](./services/todo-frontend/)

### Image-Service (Node.js + Express)

Backend service that:

* Fetches a random image from <https://picsum.photos/1200> once every 10 minutes.
* Saves the image to a persistent volume at /usr/src/app/image-cache/* image.jpg.
* Serves the same image during the 10-minute window (with one grace request).
* Survives crashes by reading the cached image on restart.
* All configuration via environment variables:
  * `PORT`
  * `IMAGE_DIR`
  * `CACHE_TIME`
  * `API_IMAGE_URL`

Image was pushed to Docker Hub repo: [yakovyakov/image-service 2.0](https://hub.docker.com/r/yakovyakov/image-service/tags?name=2.0)

Application: [services/image-service](./services/image-service/)

### Todo-Backend (Node.js + Express + PostgreSQL) v2.1 - Updated

A Node.js REST API that now uses PostgreSQL for persistent todo storage:

* Stores todos in PostgreSQL instead of in-memory array

* Logs every request attempt (including invalid ones) to stdout.

* Database schema:

    ```sql
    CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text VARCHAR(140) NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ```

* Maintains 140-character limit validation in the backend

* Exposes:
  * `GET /todos` → returns list of todos
  * `POST /todos` → adds a new todo with `{ id, text, done }`
* Configuration:
  * From ConfigMap: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`
  * From Secret: `DB_USER`, `DB_PASSWORD`

Image was pushed to Docker Hub repo: [yakovyakov/todo-backend:2.1](https://hub.docker.com/r/yakovyakov/todo-backend/tags?name=2.1)

Application: [services/todo-backend](./services/todo-backend/)

### PostgreSQL Database (StatefulSet)

* PostgreSQL running as StatefulSet (postgres-ss)

* **Persistent storage** using `volumeClaimTemplates` with `local-path` storage class

* **Headless service** `postgres-svc` for direct pod discovery

* **Automated initialization** with database `todo-db`

* **Secure credentials** via Kubernetes Secret

## Kubernets Resources

### CronJob Resources

| Resources | Purpose |
|-----------|---------|
| [CronJob](manifests/apps/cronjob/cronjob.yaml) | Scheduled job that runs hourly |
| [ConfigMap](./manifests/configmaps/cronjob-config.yaml) | Contains the bash script for todo generation|

### PostgreSQL Resources

| Resources | Purpose |
|-----------|---------|
| [StatefulSet (postgresql)](./manifests/apps/postgresql/statefulset.yaml) | PostgreSQL with PVC template |
| [Secret (postgresql)](./manifests/apps/postgresql/secret.yaml) | DB credentials (`DB_USER`, `DB_PASSWORD`) |
| [Service (postgresql)](./manifests/apps/postgresql/service.yaml) | Headless service for PostgreSQL |

### Application Resources

| Resources | Purpose |
|-----------|---------|
| [Deployment (image-service)](./manifests/apps/image-service/deployment.yaml) | Runs the image-service container, mounts  the PVC, and Uses `envFrom` to inject ConfigMap. |
| [Service (image-service-svc)](./manifests/apps/image-service/service.yaml) | Exposes the image-service on port 2345 internally. |
| [Deployment (frontend)](./manifests/apps/todo-frontentd/deployment.yaml) | Runs the React app in an Nginx container. |
| [Service (frontend-svc)](./manifests/apps/todo-frontentd/service.yaml) | Exposes the frontend on port 2345. |
| [Deployment (todo-backend)](./manifests/apps/todo-backend/deployment.yaml) | Runs the todo-backend container and Uses `envFrom` to inject ConfigMap and PostgreSQL Secret. |
| [Service (todo-backend-svc)](./manifests/apps/todo-backend/service.yaml) | Exposes the todo-backend on port 2345 internally. |

### Configuration Resources

| Resources | Purpose |
|-----------|---------|
| [ConfigMap (todo-backend-config)](./manifests/configmaps/todo-backend-config.yaml) | DB connection settings (`DB_HOST`, `DB_PORT`, `DB_NAME`) |
| [ConfigMap (image-service-config)](./manifests/configmaps/image-service-config.yaml) | `PORT`, `IMAGE_DIR`, `CACHE_TIME`, `API_IMAGE_URL` |
| [ConfigMap (todo-frontend-config)](./manifests/configmaps/todo-frontend-config.yaml) | Reserved for future frontend configuration (e.g. feature flags, API base paths if needed) |

### Storage & Networking

| Resources | Purpose |
|-----------|---------|
|[PersistentVolume (PV)](./manifests/storage/persistentvolume.yaml) | Binds to a host path (/mnt/data/kube/image-cache) to store the image across restarts. |
| [PersistentVolumeClaim (PVC)](./manifests/storage/persistentvolumeclaim.yaml)| Allows the image-service pod to claim and mount the PV. |
| [Ingress](./manifests/ingress.yaml) | Routes external traffic: <br> - `/api/image-service/*` →  `image-service-svc` <br> - `/`  → `frontend-svc` <br> - `/api/todo-backend/*` →  `todo-backend-svc`|

## Diagram

### Overall Architecture Diagram

```mermaid
graph TD
  subgraph Kubernetes Cluster
    subgraph Ingress
      I[Ingress Controller]
    end
    subgraph "Namespace: project"
      subgraph PostgreSQL StatefulSet
        PG[PostgreSQL Pod<br>postgres:13.0]
      end

      subgraph Image Service Deployment
        IS[Image Service Pod]
      end

      subgraph Frontend Deployment
        F[Frontend Pod<br>Serves Static Files]
      end

      subgraph Todo Backend Deployment
        TB[Todo-backend Pod<br>]
      end

      subgraph Volumes
        PV1[(Persistent Volume<br>Image Cache)]
        PV2[(PostgreSQL Volume<br>Stateful)]
      end

      subgraph ConfigMaps
        CM1[todo-backend-config]
        CM2[image-service-config]
        CM3[todo-frontend-config]
      end

      subgraph Secrets
        SEC[postgres-secret]
      end

      subgraph Services
        SVC1[postgres-svc]
        SVC2[todo-backend-svc]
        SVC3[frontend-svc]
        SVC4[image-service-svc]
      end
    end
  end

  subgraph External Services
    EXT[External Image API<br>https://picsum.photos/1200]
  end

  User[User/Browser] -->|GET /| I
  User -->|GET /api/image-service/random-image| I
  User -->|GET/POST /api/todo-service/todos| I

  I -->|Serve Static Files| SVC3 --> F
  I -->|/api/image-service/*| SVC4 --> IS
  I -->|/api/todo-service/*| SVC2 --> TB

  IS -->|Read/Write| PV1
  IS -->|Fetch| EXT

  TB -->|Database Operations| SVC1 --> PG
  PG -->|Persistent Storage| PV2

  CM1 -->|envFrom| TB
  CM2 -->|envFrom| IS
  CM3 -->|envFrom| F
  
  SEC -->|Credentials| TB
  SEC -->|Credentials| PG

  class IS,F,TB,PG pod;
  class PV1,PV2 storage;
  class I ingress;
  class CM1,CM2,CM3 configmap;
  class SEC secret;
  class SVC1,SVC2,SVC3,SVC4 service;
```

### CronJob Detailed Workflow

```mermaid
graph TD
  subgraph Kubernetes Cluster
    subgraph "Namespace: project"
      subgraph ConfigMap
        CM[wikipedia-todo-script]
      end
      
      subgraph CronJob
        CJ[CronJob Pod<br>curl image]
      end
      
      subgraph Todo Backend Deployment
        TB[todo-backend Pod]
      end
      
      subgraph PostgreSQL StatefulSet
        PG[PostgreSQL Pod]
      end

      subgraph Services
        SVC1[todo-backend-svc]
        SVC2[postgres-svc]
      end
    end
  end

  subgraph External Services
    WIKI[Wikipedia<br>Special:Random]
  end

  CM -->|Mounts Script| CJ
  CJ -->|1. Get random article| WIKI
  CJ -->|2. Create todo| SVC1 --> TB
  TB -->|3. Store in database| SVC2 --> PG

  class CJ,TB,PG pod;
  class SVC1,SVC2 service;
  class CM configmap;
```

## Deployment Steps

### 1. Create cluster (without Traefik)

  ```bash
  k3d cluster delete
  k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2 --k3s-arg "--disable=traefik@server:0"
  ```

### 2. Install Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

### 3. Apply Kubernetes Resources

```bash
# Apply CronJob resources (if not already deployed)
kubectl apply -f manifests/configmaps/cronjob-config.yaml -n project
kubectl apply -f manifests/apps/cronjob/ -n project

# Apply other resources (if not already deployed)
kubectl apply -f manifests/apps/postgresql/ -n project
kubectl wait --for=condition=ready pod -l app=postgres -n project --timeout=120s
kubectl apply -f manifests/configmaps/todo-backend-config.yaml -n project
kubectl apply -f manifests/apps/todo-backend/deployment.yaml -n project
kubectl apply -f manifests/storage/ -n project
kubectl apply -f manifests/configmaps/ -n project
kubectl apply -f manifests/apps/todo-frontend/ -n project
kubectl apply -f manifests/apps/image-service/ -n project
kubectl apply -f manifests/ingress.yaml -n project

# Verify deployment
kubectl get pods -n project
```

> ⚠️ Note:<br>
> Although the YAML has namespace: project, it is still good practice to use -n project for consistency.<br>
> The `PersistentVolume` (PV) is cluster-scoped and does not use namespaces.  
> The `-n project` flag is ignored for `persistentvolume.yaml`, but it is required for `persistentvolumeclaim.yaml`.  
> This command works because Kubernetes safely ignores the namespace for cluster-scoped resources.

### 4. Configure local DNS

Add this line to `/etc/hosts` :

```text
127.0.0.1 project.local
```

## Access the Application

After setting up DNS:

* Frontend: `http://project.local`
* API Todos: `http://project.local/api/todo-service/todos`
* API Image: `http://project.local/api/image-service/random-image`

---

## Testing & Behavior

### Normal Flow

1. Open `http://project.local` in your browser
2. See a random image (cached for 10 minutes)
3. See list of todos
4. Type a new todo (≤140 chars), click "Send"
5. New todo appears in the list
6. Refresh → todos still visible
7. Every hour the cronjob must enter a new todo

### Check All Resources

```bash
# Check NEW CronJob resources
kubectl get cronjobs -n project
kubectl get configmaps -n project

# Check EXISTING resources (should already be deployed)
kubectl get pods,services,deployments,statefulsets -n project
kubectl get pv,pvc -n project
kubectl get ingress -n project
```

### Test Application Functionality

```bash
# Get all todos (should be empty initially)
curl http://project.local:8081/api/todo-service/todos

# Create a new todo
curl -X POST http://project.local:8081/api/todo-service/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "Learn Kubernetes with PostgreSQL"}'

# Verify todo was created
curl http://project.local:8081/api/todo-service/todos

# Test 140-character limit validation
curl -X POST http://project.local:8081/api/todo-service/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a very long todo text that exceeds the 140 character limit that we have set for our todo application to ensure that todos remain concise and manageable for users"}'
```

#### Check backend logs

```bash
kubectl logs deployment/todo-backend-dep -n project
```

Should show:

* A log entry for the valid request (success) with details like:

  ```text
  [TODO-CREATE] SUCCESS: Created todo with ID 39, "Learn Kubernetes with PostgreSQL"

  ```

* An ERROR log entry for the invalid request with details like:

  ```text
  [TODO-CREATE] ERROR: Validation failed - Text must be 140 characters or less
  [TODO-CREATE] Received 169 characters, "This is a very long todo text that exceeds the 140..."

  ```

### Test Frontend Integration

```bash
# Open the application in browser
open http://project.local:8081

# Create todos through the frontend form
# Verify they persist after page refresh
```

## Monitoring Setup (Prometheus, Grafana, Loki)

To enable backend monitoring (including all validation logs), you can install **Prometheus**, **Grafana**, and **Loki** on the cluster following the instructions in the course:

```bash
# Add Helm repositories
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create namespace
kubectl create namespace monitoring

# Install Loki (for log collection)
helm install loki grafana/loki --namespace monitoring

# Install Promtail (log agent that sends logs to Loki)
helm install promtail grafana/promtail \
  --set "loki.serviceName=loki.monitoring.svc.cluster.local" \
  --namespace monitoring

# Install Prometheus
helm install prometheus prometheus-community/prometheus \
  --namespace monitoring

# Install Grafana
helm install grafana grafana/grafana \
  --set "grafana.ini.auth.anonymous.enabled=true" \
  --set "grafana.ini.auth.anonymous.org_role=Admin" \
  --namespace monitoring
```

Once installed:

* Access Grafana at `http://localhost:3000` (username: `admin`, password: `kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode`).

* Configure **Loki** as a data source (`http://loki.loki-stack:3100`).

* In the logs panel, filter by `{namespace="project", app="todo-backend"}` to see backend validation and error messages.

Todo-backend logs (including long text messages) will appear in real time in Grafana.

## ScreenShoot

### Validation and Logging in Action

The following screenshot shows:

* Left: `curl` commands sending valid and invalid (>140 chars) todos
* Right: Grafana dashboard displaying real-time logs from `todo-backend`

![Validation and Logging in Action](../IMG/exercise_2_10.png)

