import { Report, Shield } from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import AudioIncidentReporter from "../components/AudioIncidentReporter";
import IncidentMap from "../components/IncidentMap";

const Dashboard: React.FC = () => {
  const theme = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Box>
      <Grid
        container
        spacing={3}
        mb={3}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3} sx={{ display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                Total Reports
              </Typography>
              <Box display="flex" alignItems="center">
                <Report color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">58</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3} sx={{ display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                Safety Level
              </Typography>
              <Box display="flex" alignItems="center">
                <Shield color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Chip label="Moderate" color="warning" size="medium" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Big Red Report Button */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={3}
            sx={{
              backgroundColor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
            }}
          >
            <CardActionArea
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                py: 1,
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <Report sx={{ fontSize: 50 }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Report an Incident
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Incident Map */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Incidents in Your Area
        </Typography>
        <IncidentMap />
      </Box>

      <AudioIncidentReporter
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </Box>
  );
};

export default Dashboard;
