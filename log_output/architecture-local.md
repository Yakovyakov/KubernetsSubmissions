# Log Output Architecture (Local - k3d)

## Overview

This architecture runs entirely in a **local k3d cluster**. The `log-output` application is deployed as a multi-container pod in the `exercises` namespace. It demonstrates:

- Inter-pod communication (`log-writer` → `ping-pong`)

- Shared ephemeral storage via `emptyDir`
- Configuration via `ConfigMap`
- Database persistence via `PersistentVolume` (for PostgreSQL)
- External access via Kubernetes Ingress (routed through k3d's built-in ingress controller)

## Diagram

  ```mermaid
graph TD
  subgraph "Kubernetes Cluster (k3d)"
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