C:\Users\user\Documents\VORTEX PROJECTS\2026 PROJECTS\Secure-Digital-IMS\secure-dims>docker-compose up --build
Compose can now delegate builds to bake for better performance.
 To do so, set COMPOSE_BAKE=true.
[+] Building 12.4s (3/4)                                                                                                                                       docker:desktop-linux
 => [secure-dims internal] load build definition from Dockerfile                                                                                                               2.1s
 => => transferring dockerfile: 1.83kB                                                                                                                                         0.2s
[+] Building 12.6s (3/4)                                                                                                                                       docker:desktop-linux
 => [secure-dims internal] load build definition from Dockerfile                                                                                                               2.1s
 => => transferring dockerfile: 1.83kB                                                                                                                                         0.2s
[+] Building 12.7s (3/4)                                                                                                                                       docker:desktop-linux
 => [secure-dims internal] load build definition from Dockerfile                                                                                                               2.1s
 => => transferring dockerfile: 1.83kB                                                                                                                                         0.2s
[+] Building 12.9s (3/4)                                                                                                                                       docker:desktop-linux
 => [secure-dims internal] load build definition from Dockerfile                                                                                                               2.1s
 => => transferring dockerfile: 1.83kB                                                                                                                                         0.2s
[+] Building 229.4s (16/21)                                                                                                                     docker:desktop-linux
 => [secure-dims internal] load build definition from Dockerfile                                                                                                2.1s
 => => transferring dockerfile: 1.83kB                                                                                                                          0.2s
 => [secure-dims internal] load metadata for docker.io/library/node:20-alpine                                                                                   9.4s
 => [secure-dims auth] library/node:pull token for registry-1.docker.io                                                                                         0.0s
 => [secure-dims internal] load .dockerignore                                                                                                                   1.8s
 => => transferring context: 230B                                                                                                                               0.0s
 => [secure-dims deps 1/5] FROM docker.io/library/node:20-alpine@sha256:658d0f63e501824d6c23e06d4bb95c71e7d704537c9d9272f488ac03a370d448                       24.8s
 => => resolve docker.io/library/node:20-alpine@sha256:658d0f63e501824d6c23e06d4bb95c71e7d704537c9d9272f488ac03a370d448                                         0.6s
 => => sha256:cb3325e64457574e24f92246e3da3376946e473d636209e1390eac47b50b26a3 1.26MB / 1.26MB                                                                  1.9s
 => => sha256:fd1849a5c548bc65ee47a64498951bda5d40e87d08efe9dca69b5c8cdedc7a52 443B / 443B                                                                      0.9s
 => => sha256:8d06ba6946d1f299d8f962e37906c77006df33d47050430a57f7893ec35af697 42.78MB / 42.78MB                                                               14.2s
 => => sha256:1074353eec0db2c1d81d5af2671e56e00cf5738486f5762609ea33d606f88612 3.86MB / 3.86MB                                                                  3.3s
 => => extracting sha256:1074353eec0db2c1d81d5af2671e56e00cf5738486f5762609ea33d606f88612                                                                       0.8s
 => => extracting sha256:8d06ba6946d1f299d8f962e37906c77006df33d47050430a57f7893ec35af697                                                                       2.2s
 => => extracting sha256:cb3325e64457574e24f92246e3da3376946e473d636209e1390eac47b50b26a3                                                                       0.7s
 => => extracting sha256:fd1849a5c548bc65ee47a64498951bda5d40e87d08efe9dca69b5c8cdedc7a52                                                                       0.5s
 => [secure-dims internal] load build context                                                                                                                   4.4s
 => => transferring context: 364.09kB                                                                                                                           0.3s
 => [secure-dims builder 2/5] WORKDIR /app                                                                                                                      6.3s
 => [secure-dims deps 2/5] RUN apk add --no-cache libc6-compat                                                                                                 13.9s
 => [secure-dims runner 3/9] RUN addgroup --system --gid 1001 nodejs                                                                                            3.5s
 => [secure-dims runner 4/9] RUN adduser --system --uid 1001 nextjs                                                                                             3.1s
 => [secure-dims deps 3/5] WORKDIR /app                                                                                                                         3.4s
 => [secure-dims deps 4/5] COPY package.json package-lock.json* ./                                                                                              6.6s
 => [secure-dims deps 5/5] RUN npm ci                                                                                                                          80.8s
 => [secure-dims builder 3/5] COPY --from=deps /app/node_modules ./node_modules                                                                                34.8s
 => [secure-dims builder 4/5] COPY . .                                                                                                                          3.6s
 => ERROR [secure-dims builder 5/5] RUN npm run build                                                                                                          39.7s
------
 > [secure-dims builder 5/5] RUN npm run build:
5.459
5.459 > secure-dims@0.1.0 build
5.459 > next build
5.459
6.778 Attention: Next.js now collects completely anonymous telemetry regarding usage.
6.782 This information is used to shape Next.js' roadmap and prioritize features.
6.784 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
6.785 https://nextjs.org/telemetry
6.789
6.925 ▲ Next.js 16.1.1 (Turbopack)
6.926
7.212   Creating an optimized production build ...
31.58 ✓ Compiled successfully in 23.6s
31.62   Running TypeScript ...
36.86   Collecting page data using 7 workers ...
37.65   Generating static pages using 7 workers (0/4) ...
38.28 Error occurred prerendering page "/". Read more: https://nextjs.org/docs/messages/prerender-error
38.29 Error: supabaseUrl is required.
38.29     at <unknown> (.next/server/chunks/ssr/[root-of-the-server]__65a541ba._.js:37:42518)
38.29     at new cE (.next/server/chunks/ssr/[root-of-the-server]__65a541ba._.js:37:42769)
38.29     at module evaluation (.next/server/chunks/ssr/[root-of-the-server]__65a541ba._.js:37:47041)
38.29     at instantiateModule (.next/server/chunks/ssr/[turbopack]_runtime.js:740:9)
38.29     at getOrInstantiateModuleFromParent (.next/server/chunks/ssr/[turbopack]_runtime.js:763:12)
38.29     at Context.commonJsRequire [as r] (.next/server/chunks/ssr/[turbopack]_runtime.js:249:12) {
38.29   digest: '1459758064'
38.29 }
38.29 Export encountered an error on /page: /, exiting the build.
38.32 ⨯ Next.js build worker exited with code: 1 and signal: null
38.36 npm notice
38.36 npm notice New major version of npm available! 10.8.2 -> 11.7.0
38.36 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
38.36 npm notice To update run: npm install -g npm@11.7.0
38.36 npm notice
------
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
