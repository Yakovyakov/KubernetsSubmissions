# Application Architecture (Local - k3d)

## Overview

Full-stack application deployed in a **local k3d cluster** under the `project` namespace. It includes:

- **Frontend**: React SPA served via Nginx.
- **Todo Backend**: Node.js API with PostgreSQL persistence and request validation (140-char limit).
- **Image Service**: Caches a random image from `picsum.photos` using a PersistentVolume.
- **PostgreSQL**: StatefulSet with persistent storage.
- **CronJob**: Hourly job that fetches a random Wikipedia article and creates a todo.
- **Ingress**: Routes traffic to frontend, backend, and image service.
- **Monitoring-ready**: Logs are written to stdout for collection by tools like Loki/Grafana.

All external access uses the custom domain `project.local`.

---

## Overall Architecture

```mermaid
graph TD
  subgraph "Kubernetes Cluster (k3d)"
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

      subgraph CronJob
        CJ[CronJob Pod]
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
        CM4[wikipedia-todo-script]
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

    EXT1[Wikipedia<br>Special:Random]
  end

  User[User/Browser] -->|GET /| I
  User -->|GET /api/image-service/random-image| I
  User -->|"GET|POST /api/todo-service/todos"| I

  CJ -->|Creates todo via| SVC2
  CJ -->|Runs hourly| EXT1

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
  CM4 -->|envFrom| CJ
  
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
