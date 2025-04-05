# Sound Buster

Sound Buster is an AI-powered project designed to listen to environmental cues and alert authorities in case of a crime.

## Features

- AI listens to environmental sounds
- Alerts authorities if a crime is detected

## Getting Started

To get started with the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/DanNgobe/crime-busters.git
cd crime-busters
npm install -g pnpm
```

## Development

To start the development server for the client and server, run:

To run the client

```bash
pnpm install
pnpm dev
```

To run the server

```bash
pnpm install
pnpm dev
```

## Building

To build the client for production, run:

```bash
pnpm build
pnpm preview
```

## Environment Variables

For the client, you need to set the following environment variable:

```
VITE_API_URL=<http://server.com>    e.g  http://localhost:3000
```
