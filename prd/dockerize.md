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

- **`Dockerfile`**: Defines the multi-stage build process. It now accepts `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as build arguments to allow Next.js to prerender pages during the build.
- **`docker-compose.yml`**: Defines the `secure-dims` service. It passes the build arguments from your local `.env` file to the Docker build process.
- **`.dockerignore`**: Ensures that local `node_modules`, `.next` folders, and sensitive files are not sent to the Docker daemon.

## How to Run

1.  Open a terminal (PowerShell or Bash).
2.  Navigate to the `secure-dims` directory.
3.  **Important**: Docker Compose looks for a file named `.env` to pass variables to the build process. If you have `.env.local`, copy it to `.env`:
    ```powershell
    copy .env.local .env
    ```
4.  Start the application with Docker Compose:
    ```bash
    docker-compose up --build
    ```
5.  Once the logs show `✓ Ready in ...`, access the application at:
    [http://localhost:3000](http://localhost:3000)

## Environment Variables

The container automatically reads variables from `secure-dims/.env.local`. Ensure the following are set:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your project's Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your project's Supabase Anonymous Key |

## Reflecting Code Changes

Since this Docker setup is optimized for **production/standalone** use (which is best for sharing the project), it does not use hot-reloading by default. 

To reflect changes you've made to the code:
1.  Save your files.
2.  Stop the current container (press `Ctrl + C` in the terminal).
3.  Run the build command again:
    ```bash
    docker-compose up --build
    ```

> [!TIP]
> For active development where you want instant updates (hot reloading), it is recommended to run the project locally outside of Docker using `npm run dev` in the `secure-dims` directory.

## Troubleshooting

- **Build Failures**: Ensure you are in the `secure-dims` directory where the `Dockerfile` resides.
- **Connection Issues**: Ensure port 3000 is not being used by another process.
- **Supabase Errors**: Verify that your `.env.local` keys are correct and accessible by the container.
