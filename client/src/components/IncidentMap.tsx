import { Box, Chip, Typography, useMediaQuery, useTheme } from "@mui/material";
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { useGetQuery } from "../hooks";
import useGeolocation from "../hooks/useGeolocation";
import { Incident } from "../types";
import createIncidentIcon from "../utils/createIncidentIcon";
import {
  getUrgencyChipColor,
  getUrgencyColor,
} from "../utils/getUrgencyColors";

const IncidentMap: React.FC = () => {
  const [visibleMarkers, setVisibleMarkers] = useState(true);
  const { data: incidents } = useGetQuery<Incident[]>({
    resource: "incidents",
    queryKey: "incidents",
  });
  const unresolvedIncidents = incidents?.filter(
    (incident) => incident.status !== "resolved"
  );

  const userLocation = useGeolocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!userLocation) {
    return <Typography>Loading your location...</Typography>;
  }

  return (
    <Box
      sx={{
        height: isMobile ? "60vh" : "80vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <MapContainer
        //@ts-ignore
        center={userLocation}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          //@ts-ignore
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapZoomControl setVisibleMarkers={setVisibleMarkers} />

        {visibleMarkers &&
          unresolvedIncidents?.map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              //@ts-ignore
              icon={createIncidentIcon(
                incident.type,
                getUrgencyColor(incident.urgency, theme)
              )}
            >
              <Popup>
                <Chip
                  label={`Urgency: ${incident.urgency.toUpperCase()}`}
                  color={getUrgencyChipColor(incident.urgency)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h6" gutterBottom>
                  {incident.title}
                </Typography>
                <Typography variant="body2">{incident.description}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Status:</strong> {incident.status}
                </Typography>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </Box>
  );
};

const MapZoomControl: React.FC<{
  setVisibleMarkers: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setVisibleMarkers }) => {
  useMapEvents({
    zoomend() {
      //@ts-ignore
      const zoomLevel = this.getZoom();
      setVisibleMarkers(zoomLevel > 8);
    },
  });
  return null;
};

export default IncidentMap;
