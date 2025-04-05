# Crime Buster

Crime Buster is an AI-powered project designed to listen to environmental cues and alert authorities in case of a crime.

## 🚀 Features

- AI listens to environmental sounds
- Alerts authorities if a crime is detected
- Web-based interface for visualization and reporting

## 📦 Project Structure

```
crime-busters/
├── client/          # React (Vite) frontend with AI sound detection
├── server/          # Backend API service
├── docker-compose.yml
├── .env
└── README.md
```

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/DanNgobe/crime-busters.git
cd crime-busters
```

### 2. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

---

## 💻 Local Development

### Running the Client

```bash
cd client
pnpm install
pnpm dev
```

### Running the Server

```bash
cd server
pnpm install
pnpm dev
```

---

## 🐳 Running with Docker

Make sure Docker and Docker Compose are installed on your system.

### 1. Setup environment variables

Create a `.env` file in the root directory with the following values:

```env
MYSQL_HOST=db
MYSQL_USER=db_user
MYSQL_PASSWORD=password
MYSQL_DATABASE=crime_busters
VITE_API_URL=http://server:5000
VITE_GEMINI_API_KEY= <key here>
```

### 2. Run all services

```bash
docker-compose up --build -d
```

### 3. Access the app

- Frontend: [http://localhost:4000](http://localhost:4000)
- Backend API: [http://localhost:5000](http://localhost:5000)

---

## 🌍 Environment Variables

### Client `.env`

```env
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY= <key here>
```

### Server `.env`

```env
MYSQL_ROOT_PASSWORD=yourpassword
MYSQL_DATABASE=crime_buster_db
MYSQL_USER=crime_user
MYSQL_PASSWORD=yourpassword
```

---

## 📄 License

MIT License © 2025 DanNgobe
