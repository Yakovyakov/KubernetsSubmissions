<!-- markdownlint-disable no-inline-html -->
# Kubernetes Exercise 2.6: Externalize Configuration

This exercise ensures that **no configuration is hard-coded** in the application source code. All configuration (ports, paths, URLs) is injected via environment variables from ConfigMaps.

## Objective

* Remove hard-coded values from source code
* Define configuration in ConfigMaps
* Inject configuration into Pods via `envFrom`
* Use relative API paths in frontend (resolved by Ingress)

## Components

| Component | Role |
|--------|------|
| `project` namespace | Isolated environment for the project |
| `todo-frontend` | React SPA served via Nginx |
| `todo-backend` | REST API: `GET /todos`, `POST /todos` (in-memory storage) |
| `image-service` | Fetches and caches a random image from `picsum.photos` |
| `image-cache-pvc` | PersistentVolumeClaim for storing the cached image |
| `project.local` | Custom domain for accessing the project |
| `todo-backend-config` | ConfigMap: `PORT` |
| `image-service-config` | ConfigMap: `PORT`, `IMAGE_DIR`, `REFRESH_INTERVAL`, `API_IMAGE_URL` |
| `todo-frontend-config` | ConfigMap: reserved for future frontend configuration |

> Communication:
>
> * Frontend → `GET /api/todo-service/todos`
> * Frontend → `GET /api/image-service/random-image`
> * `todo-backend` stores todos in memory

## The project structure

  ```tree
  the_project/
  ├── manifests/
  │   ├── configmaps/
  │   │   ├── todo-backend-config.yaml
  │   │   ├── image-service-config.yaml
  │   │   └── todo-frontend-config.yaml
  │   ├── storage/
  │   │   ├── persistentvolume.yaml
  │   │   └── persistentvolumeclaim.yaml
  │   ├── apps/
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

### Todo-Backend (Node.js + Express)

New service responsible for managing todos:

* Stores todos in memory (array) — no database yet.
* Exposes:
  * `GET /todos` → returns list of todos
  * `POST /todos` → adds a new todo with `{ id, text, done }`
* Configurable port via `PORT` (from ConfigMap)

Image was pushed to Docker Hub repo: [yakovyakov/todo-backend:1.0](https://hub.docker.com/r/yakovyakov/todo-backend/tags?name=1.0)

Application: [services/todo-backend](./services/todo-backend/)

## Kubernets Resources

| Resources | Purpose |
|-----------|---------|
| [ConfigMap (todo-backend-config)](./manifests/configmaps/todo-backend-config.yaml) | `PORT` for todo-backend |
| [ConfigMap (image-service-config)](./manifests/configmaps/image-service-config.yaml) | `PORT`, `IMAGE_DIR`, `CACHE_TIME`, `API_IMAGE_URL` |
| [ConfigMap (todo-frontend-config)](./manifests/configmaps/todo-frontend-config.yaml) | Reserved for future frontend configuration (e.g. feature flags, API base paths if needed) |
|[PersistentVolume (PV)](./manifests/storage/persistentvolume.yaml) | Binds to a host path (/mnt/data/kube/image-cache) to store the image across restarts. |
| [PersistentVolumeClaim (PVC)](./manifests/storage/persistentvolumeclaim.yaml)| Allows the image-service pod to claim and mount the PV. |
| [Deployment (image-service)](./manifests/apps/image-service/deployment.yaml) | Runs the image-service container, mounts  the PVC, and Uses `envFrom` to inject ConfigMap. |
| [Service (image-service-svc)](./manifests/apps/image-service/service.yaml) | Exposes the image-service on port 2345 internally. |
| [Deployment (frontend)](./manifests/apps/todo-frontentd/deployment.yaml) | Runs the React app in an Nginx container. |
| [Service (frontend-svc)](./manifests/apps/todo-frontentd/service.yaml) | Exposes the frontend on port 2345. |
| [Deployment (todo-backend)](./manifests/apps/todo-backend/deployment.yaml) | Runs the todo-backend container and Uses `envFrom` to inject ConfigMap. |
| [Service (todo-backend-svc)](./manifests/apps/todo-backend/service.yaml) | Exposes the todo-backend on port 2345 internally. |
| [Ingress](./manifests/ingress.yaml) | Routes external traffic: <br> - `/api/image-service/*` →  `image-service-svc` <br> - `/`  → `frontend-svc` <br> - `/api/todo-backend/*` →  `todo-backend-svc`|

## Diagram

  ```mermaid
graph TD
  subgraph Kubernetes Cluster
    subgraph Ingress
      I[Ingress Controller]
    end
    subgraph "Namespace: project"
      subgraph Image Service Deployment
        IS[Image Service Pod]
      end

      subgraph Frontend Deployment
        F[Frontend Pod]
      end

      subgraph Todo Backend Deployment
        TB[Todo-backend Pod]
      end

      subgraph Volumes
        PV[(Persistent Volume<br>Image Cache)]
      end

      subgraph ConfigMaps
        CM1[todo-backend-config]
        CM2[image-service-config]
        CM3[todo-frontend-config]
      end
    end
  end

  subgraph External Services
    EXT[External Image API<br>https://picsum.photos/1200]
  end

  User[User] -->|GET /| I
  User -->|GET /api/image-service/random-image| I
  User -->|GET /api/todo-service/todos| I
  User -->|POST /api/todo-service/todos| I

  I -->|/| F
  I -->|/random-image| IS
  I -->|/todos| TB

  IS -->|Read/Write| PV
  IS -->|Fetch| EXT

  CM1 -->|envFrom| TB
  CM2 -->|envFrom| IS
  CM3 -. future .-> F

  class IS,F,TB pod;
  class PV storage;
  class I ingress;
  class CM1,CM2,CM3 configmap;
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

### Create the `project` namespace

  ```bash
  kubectl create namespace project || true
  ```

## Deployment

Apply all configurations:

  ```bash
  kubectl apply -f manifests/storage -n project                  # PV & PVC
  kubectl apply -f manifests/configmaps -n project               # ConfigMaps
  kubectl apply -f manifests/apps/image-service -n project       # Image service
  kubectl apply -f manifests/apps/todo-backend -n project        # Todo backend
  kubectl apply -f manifests/apps/todo-frontend -n project       # Frontend
  kubectl apply -f manifests/ingress.yaml -n project             # Ingress
  ```

> ⚠️ Note:<br>
> Although the YAML has namespace: project, it is still good practice to use -n project for consistency.<br>
> The `PersistentVolume` (PV) is cluster-scoped and does not use namespaces.  
> The `-n project` flag is ignored for `persistentvolume.yaml`, but it is required for `persistentvolumeclaim.yaml`.  
> This command works because Kubernetes safely ignores the namespace for cluster-scoped resources.

## Configure local DNS

Add this line to `/etc/hosts` :

```text
127.0.0.1 project.local
```

## Access the Application

After setting up DNS:

* Frontend: `http://project.local`
* API Todos: `http://project.local/api/todo-service/todos`
* API Image: `http://project.local/api/image-service/random-image`

## Testing & Behavior

Normal Flow

1. Open `http://project.local` in your browser
2. See a random image (cached for 10 minutes)
3. See list of todos
4. Type a new todo (≤140 chars), click "Send"
5. New todo appears in the list
6. Refresh → todos still visible (stored in backend memory)

### Test Endpoint Manually

  ```bash
  # Get todos
  curl http://project.local:8081/api/todo-service/todos

  # Create a new todo
  curl -X POST http://project.local:8081/api/todo-service/todos \
    -H "Content-Type: application/json" \
    -d '{"text": "Learn Kubernetes"}'
  ```

### Container Crash Test

  ```bash
  # Restart todo-backend
  kubectl delete pod -l app=todo-backend -n project

  # Todos are lost (in-memory storage), but service recovers
  ### Manual Refresh (for testing)
  ```

  **Note:** Todos are stored in memory, so they are lost on restart

## Monitoring

  ```bash
  # Follow logs
  kubectl logs -f deployment/image-service-dep -n project
  kubectl logs -f deployment/todo-backend-dep -n project
  kubectl logs -f deployment/todo-frontend-dep -n project

  # Verify image cache
  kubectl exec -it $(kubectl get pod -l app=image-service -n project -o jsonpath='{.items[0].metadata.name}') -n project -- ls -l /usr/src/app/image-cache/
  ```

## Verification (Exercise 2.6)

### Check that no configuration is hard-coded

  ```bash
  # Check that no configuration is hard-coded
  grep -r "2345\|300\|60\|8080\|localhost\|dirname\|127.0.0.1\|\/usr\/src\/app\|https://picsum.photos" \
   --include="*.js" \
   --include="*.ts" \
   --include="*.jsx" \
   --exclude-dir=*node_modules \
   --exclude="*.json" \
   --exclude="*vite.config.js" \
   --exclude="*.lock" \
   --exclude-dir=*dist \
   services/
  ```

→ Expected output: Only lines using `process.env.VAR || 'default'` pattern.

### Verify environment variables in Pods

  ```bash
  
  # Check image-service
  kubectl exec -it $(kubectl get pod -l app=image-service -n project -o jsonpath='{.items[0].metadata.name}') -n project -- env | grep IMAGE_DIR
  
  # Check todo-backend
  kubectl exec -it $(kubectl get pod -l app=todo-backend -n project -o jsonpath='{.items[0].metadata.name}') -n project -- env | grep PORT
 
  ```

### Verify ConfigMaps exist

  ```bash
  # Verify ConfigMaps
  kubectl get configmaps -n project
  ```

Should include: todo-backend-config, image-service-config, todo-frontend-config

## ScreenShoot

<img src="../IMG/exercise_2_6.png" alt="Screenshoot Exercise 2.6" width="600">
