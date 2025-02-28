const { Incident } = require("../models");

// Get all incidents
exports.getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.findAll();
    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ message: "Error fetching incidents" });
  }
};

// Create an incident
exports.createIncident = async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      description,
      latitude,
      longitude,
      urgency,
      status,
    } = req.body;

    const newIncident = await Incident.create({
      userId,
      type,
      title,
      description,
      latitude,
      longitude,
      urgency,
      status,
    });

    res.status(201).json(newIncident);
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ message: "Error creating incident" });
  }
};
