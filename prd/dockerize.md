# Dockerization of Secure-Digital-IMS

This document outlines the Docker configuration for the Secure-Digital-IMS project, designed for easy deployment and consistent research environments.

## Architecture & Optimization

The project uses an optimized Docker setup for Next.js 16+, focusing on security and minimal image size.

### Multi-Stage Build
The `Dockerfile` is divided into three stages:
1.  **Deps**: Installs necessary system libraries (`libc6-compat`) and project dependencies using `npm ci`.
2.  **Builder**: Inherits from `Deps`, copies source code, and runs `npm run build`. This stage leverages Next.js's `standalone` output mode.
3.  **Runner**: The final production image. It only contains the minimal files needed to run the application (the `standalone` folder and `static` assets). It runs as a non-root `nextjs` user for enhanced security.

### Standalone Output
In `next.config.ts`, we enabled:
```typescript
{
  output: 'standalone'
}
```
This causes Next.js to package only the necessary `node_modules` and server files into a single directory, reducing the final image size from ~1GB to ~100MB.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- A `.env.local` file in the `secure-dims` directory with valid Supabase credentials.

## Configuration Files

- **`Dockerfile`**: Defines the multi-stage build process.
- **`docker-compose.yml`**: Defines the `secure-dims` service, port mappings (3000:3000), and environment variable loading.
- **`.dockerignore`**: Ensures that local `node_modules`, `.next` folders, and sensitive files are not sent to the Docker daemon, speeding up builds and keeping the image clean.

## How to Run

1.  Open a terminal (PowerShell or Bash).
2.  Navigate to the `secure-dims` directory:
    ```bash
    cd "c:\Users\user\Documents\OZORO PROJECTS\2026 PROJECTS\Secure-Digital-IMS\secure-dims"
    ```
3.  Start the application with Docker Compose:
    ```bash
    docker-compose up --build
    ```
4.  Once the logs show `✓ Ready in ...`, access the application at:
    [http://localhost:3000](http://localhost:3000)

## Environment Variables

The container automatically reads variables from `secure-dims/.env.local`. Ensure the following are set:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your project's Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your project's Supabase Anonymous Key |

## Troubleshooting

- **Build Failures**: Ensure you are in the `secure-dims` directory where the `Dockerfile` resides.
- **Connection Issues**: Ensure port 3000 is not being used by another process.
- **Supabase Errors**: Verify that your `.env.local` keys are correct and accessible by the container.
