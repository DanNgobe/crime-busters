import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import AudioToxicityChecker from "../components/AudioToxicityChecker";
import MoveNetDetectorLimbSplit from "../components/MoveNetDetector";
import SoundDetector from "../components/SoundDetector";

type Tool = {
  name: string;
  description: string;
  icon: React.ReactNode;
};

const tools: Tool[] = [
  {
    name: "Audio Toxicity Checker",
    description: "Check for toxic language in audio recordings",
    icon: <RecordVoiceOverIcon color="primary" fontSize="large" />,
  },
  {
    name: "Sound Detector",
    description: "Detect sounds using YAMNet",
    icon: <GraphicEqIcon color="primary" fontSize="large" />,
  },
  {
    name: "Motion Detector",
    description: "Detect human poses using MoveNet",
    icon: <DirectionsRunIcon color="primary" fontSize="large" />,
  },
];

const ToolsPage: React.FC = () => {
  const theme = useTheme();
  const [openTool, setOpenTool] = useState<Tool | null>(null);

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        🧰 Tools (Beta)
      </Typography>

      <Grid container spacing={3} mt={3}>
        {tools.map((tool) => (
          <Grid key={tool.name} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderLeft: `6px solid ${theme.palette.primary.main}`,
                height: "100%",
              }}
            >
              <CardActionArea onClick={() => setOpenTool(tool)}>
                <Box display="flex" alignItems="center" gap={2}>
                  {tool.icon}
                  <CardContent sx={{ padding: 0 }}>
                    <Typography variant="h6">{tool.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tool.description}
                    </Typography>
                  </CardContent>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {openTool?.name === "Motion Detector" && (
        <Box
          sx={{
            mt: 4,
            p: 2,
          }}
        >
          <MoveNetDetectorLimbSplit />
        </Box>
      )}

      {openTool?.name === "Audio Toxicity Checker" && (
        <AudioToxicityChecker
          isModalOpen={openTool !== null}
          setIsModalOpen={(isOpen) => {
            if (!isOpen) {
              setOpenTool(null);
            }
          }}
        />
      )}

      {openTool?.name === "Sound Detector" && (
        <SoundDetector
          isModalOpen={openTool !== null}
          setIsModalOpen={(isOpen) => {
            if (!isOpen) {
              setOpenTool(null);
            }
          }}
        />
      )}
    </Box>
  );
};

export default ToolsPage;
