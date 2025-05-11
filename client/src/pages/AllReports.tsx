// src/pages/AllReportsPage.tsx
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RoomIcon from "@mui/icons-material/Room";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Avatar,
  Box,
  Card,
  Chip,
  Container,
  Grid,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useGetQuery, useUpdateMutation } from "../hooks";
import { Incident } from "../types";
import {
  getUrgencyChipColor,
  getUrgencyColor,
} from "../utils/getUrgencyColors";

const incidentIcons: Record<string, string> = {
  Pothole: "/icons/pothole.png",
  Crime: "/icons/crime.png",
  Flooding: "/icons/flooding.png",
  Fire: "/icons/fire.png",
  Accident: "/icons/accident.png",
  Other: "/icons/other.png",
};

const AllReportsPage: React.FC = () => {
  const theme = useTheme();

  const { data, isLoading } = useGetQuery<Incident[]>({
    resource: "incidents",
    queryKey: "all-reports",
  });
  const unresolvedIncidents = data?.filter(
    (incident) => incident.status !== "resolved"
  );
  const updateStatus = useUpdateMutation({
    resource: "incidents",
    invalidateKeys: ["all-reports"],
    onSuccessMessage: "Status updated",
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    console.log("Updating status for incident ID:", id);
    console.log("New status:", newStatus);
    updateStatus.mutate({ id, data: { status: newStatus } });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        🧾 All Incident Reports
      </Typography>
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3} mt={2}>
          {unresolvedIncidents?.map((incident) => (
            <Grid size={{ xs: 12 }} key={incident.id}>
              <Card
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  borderLeft: `6px solid ${getUrgencyColor(
                    incident.urgency,
                    theme
                  )}`,
                }}
              >
                <Avatar
                  src={incidentIcons[incident.type] || incidentIcons.Other}
                  alt={incident.type}
                  variant="rounded"
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{incident.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {incident.description}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <RoomIcon fontSize="small" />
                    <Typography variant="caption">
                      Lat: {incident.latitude}, Lng: {incident.longitude}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="caption">
                      Reported: {new Date(incident.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  gap={1}
                >
                  <Chip
                    icon={<WarningIcon />}
                    label={incident.urgency}
                    color={getUrgencyChipColor(incident.urgency)}
                    size="small"
                  />
                  <Select
                    size="small"
                    value={incident.status}
                    onChange={(e) =>
                      handleStatusChange(incident.id, e.target.value)
                    }
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AllReportsPage;
