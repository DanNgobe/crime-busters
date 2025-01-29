FROM node:20-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN pnpm build

RUN npm install -g serve

# Expose client port (only for the client service)
EXPOSE 5000

# Expose server port (only for the server service)
EXPOSE 4000
