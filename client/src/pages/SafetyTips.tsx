import FireExtinguisherIcon from "@mui/icons-material/FireExtinguisher";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PublicIcon from "@mui/icons-material/Public";
import RefreshIcon from "@mui/icons-material/Refresh";
import SecurityIcon from "@mui/icons-material/Security";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const VITE_GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const LOCAL_STORAGE_KEY = "cached_safety_tips";

const SafetyTipsPage: React.FC = () => {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const theme = useTheme();

  const fetchSafetyTips = async (forceRefresh = false) => {
    const cachedTips = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedTips && !forceRefresh) {
      setTips(JSON.parse(cachedTips));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(VITE_GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
  Generate a JSON array of 6 public safety tips that apply generally (fire, accident, natural disasters, etc.). Format:
  [
    "Tip 1",
    "Tip 2",
    ...
  ]
  Respond with only the JSON array.
                    `,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const responseText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      const jsonStart = responseText.indexOf("[");
      const jsonEnd = responseText.lastIndexOf("]");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        const json = responseText.substring(jsonStart, jsonEnd + 1);
        const parsedTips = JSON.parse(json);
        setTips(parsedTips);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedTips));
      } else {
        showToast("Invalid response from Gemini", "error");
      }
    } catch (error) {
      console.error("Error fetching safety tips:", error);
      showToast("Error contacting Gemini API", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyTips();
  }, []);

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        mb: 8,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        padding: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        🛡️ Safety Tips
      </Typography>

      <Typography variant="body1" gutterBottom>
        Stay informed and prepared with helpful safety guidance.
      </Typography>

      <Button
        variant="outlined"
        onClick={() => fetchSafetyTips(true)}
        startIcon={<RefreshIcon />}
        sx={{ my: 3 }}
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh Tips"}
      </Button>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tips.map((tip, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Card
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  height: "100%",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 6,
                  },
                  borderLeft: `6px solid ${theme.palette.primary.main}`,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <SecurityIcon
                      color="primary"
                      sx={{ mr: 1, fontSize: "1.4rem" }}
                    />
                    <Typography fontWeight="bold">Tip #{index + 1}</Typography>
                  </Box>
                  <Typography variant="body2">{tip}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box mt={6}>
        <Typography variant="h5" gutterBottom mb={2}>
          🚨 Emergency Contacts
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderLeft: `6px solid ${theme.palette.error.main}`,
              }}
            >
              <SecurityIcon color="error" />
              <Box>
                <Typography fontWeight="bold">Police</Typography>
                <Typography variant="body2">10111</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderLeft: `6px solid ${theme.palette.warning.main}`,
              }}
            >
              <FireExtinguisherIcon color="warning" />
              <Box>
                <Typography fontWeight="bold">Fire and Rescue</Typography>
                <Typography variant="body2">10177</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderLeft: `6px solid ${theme.palette.info.main}`,
              }}
            >
              <LocalHospitalIcon color="info" />
              <Box>
                <Typography fontWeight="bold">Ambulance</Typography>
                <Typography variant="body2">112 (from mobile)</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderLeft: `6px solid ${theme.palette.primary.main}`,
              }}
            >
              <PublicIcon color="primary" />
              <Box>
                <Typography fontWeight="bold">
                  Disaster Management Centre
                </Typography>
                <Typography variant="body2">0800 029 999</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SafetyTipsPage;
