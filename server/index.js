const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database"); // Import Sequelize connection
const incidentRoutes = require("./routes/incidentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/incidents", incidentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    await sequelize.sync(); // Sync models with database

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

startServer();
