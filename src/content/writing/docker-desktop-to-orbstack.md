---
title: Moving from Docker Desktop to Orbstack
date: 2026-07-04
description: I have been looking for an alternative to Docker Desktop on Mac for a while
draft: false
---
I have been looking for an alternative to Docker Desktop on Mac for a while, mostly because it eats a lot of memory, takes much time to launch, contains a lot of noise in the docker desktop app. I just had to have the Docker Desktop app to run `docker daemon`.
## Why Orbstack
[OrbStack](https://orbstack.dev/) is a drop-in replacement for Docker Desktop that's fast, light, simple, and easy to use. Its interface is much cleaner and it launches in no time. There is also a [guide](https://betterstack.com/community/guides/scaling-docker/switching-to-orbstack-on-macos/#migrating-data-from-docker-desktop) to migrate from Docker Desktop to Orbstack.

A simple command:
```bash
orb migrate docker
```

## Issue I'm Facing
I have been coding inside a running container in VS Code and there was a lot of data (~10.3 GB) that did not have a volume. So all the data is with Docker Desktop. to be continued...
