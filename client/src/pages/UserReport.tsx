import { useAuth } from "@clerk/clerk-react";
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
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useGetQuery } from "../hooks";
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

const UserReportsPage: React.FC = () => {
  const theme = useTheme();
  const { userId } = useAuth();

  const { data, isLoading } = useGetQuery<Incident[]>({
    resource: `incidents/${userId}`,
    queryKey: "user-reports",
  });

  const reports = data || [];

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Loading your reports...
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        mb: 6,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        padding: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        📝 My Incident Reports
      </Typography>
      <Typography variant="body1" gutterBottom>
        A list of incidents you have reported so far.
      </Typography>

      <Grid container spacing={3} mt={2}>
        {reports.length === 0 ? (
          <Grid size={{ xs: 1 }}>
            <Typography>No reports yet.</Typography>
          </Grid>
        ) : (
          reports.map((incident) => (
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
                  <Chip
                    label={incident.status}
                    variant="outlined"
                    color={
                      incident.status === "resolved"
                        ? "success"
                        : incident.status === "in-progress"
                        ? "warning"
                        : "default"
                    }
                    size="small"
                  />
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default UserReportsPage;
