import { useAuth } from "@clerk/clerk-react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useCreateMutation } from "../hooks";
import useGeolocation from "../hooks/useGeolocation";
import { IncidentInput } from "../types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const VITE_GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const AudioIncidentReporter: React.FC<{
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isModalOpen, setIsModalOpen }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [incidentDetected, setIncidentDetected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const userLocation = useGeolocation();

  const { showToast } = useToast();
  const { userId } = useAuth();
  const theme = useTheme();

  const { mutate: reportIncident } = useCreateMutation({
    resource: "incidents",
    onSuccessMessage: "Incident reported successfully",
  });

  const classifySpeech = async (text: string) => {
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
  You are an AI trained to classify real-world incidents based on speech input.
  Analyze the following statement and determine:
  1. The **type** of incident (choose from: "Crime", "Fire", "Pothole", "Accident", "Flooding", "Medical Emergency", "Earthquake", "Other", "None").
  2. The **urgency level** (choose from: "low", "medium", "high", "critical").
  3. A **brief explanation** justifying the classification.
  
  Format your response as pure JSON:
  {
    "incident_type": "Fire",
    "urgency": "high",
    "reason": "The speaker mentioned a house is on fire and people need immediate help."
  }
  
  Do not include any text outside of the JSON.
  
  Speech Input: "${text}"
                    `,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      let responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let jsonStart = responseText.indexOf("{");
      let jsonEnd = responseText.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        responseText = responseText.substring(jsonStart, jsonEnd + 1);
      }

      try {
        const parsedResponse = JSON.parse(responseText);

        if (parsedResponse.incident_type && parsedResponse.urgency) {
          setIncidentDetected(parsedResponse.incident_type);
          if (parsedResponse.incident_type === "None") {
            showToast("No incident detected in the speech input", "info");
            return;
          }
          reportIncident(createIncidentPayload(parsedResponse));
        } else {
          console.error("Invalid JSON format:", parsedResponse);
        }
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
      }
    } catch (error) {
      console.error("Error classifying speech:", error);
      showToast("Error communicating with Gemini API", "error");
    }
    setLoading(false);
  };

  const createIncidentPayload = (data: {
    incident_type: string;
    urgency: string;
    reason: string;
  }): IncidentInput => ({
    type: data.incident_type,
    title: `Detected ${data.incident_type}`,
    description: `Reason: ${data.reason}`,
    urgency: data.urgency,
    latitude: userLocation?.[0] ?? 0,
    longitude: userLocation?.[1] ?? 0,
    status: "pending",
    userId: userId ?? "",
  });

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const handleResult = (event: any) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        }
      }
      setTranscript(finalTranscript);
    };

    recognition.onresult = handleResult;

    if (listening) {
      recognition.start();
    } else {
      recognition.stop();
      if (transcript) {
        classifySpeech(transcript);
      }
    }

    return () => recognition.stop();
  }, [listening]);

  return (
    <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth>
      <DialogTitle>Audio Incident Reporter</DialogTitle>
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" mb={2}>
            <CircularProgress />
          </Box>
        )}

        <Box
          mb={2}
          p={2}
          borderRadius={2}
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          <Typography variant="h6">Transcript:</Typography>
          <Typography>
            {transcript || "Start speaking to see the transcript..."}
          </Typography>
        </Box>

        {incidentDetected && (
          <Box
            p={2}
            borderRadius={2}
            mb={2}
            sx={{ backgroundColor: theme.palette.error.light }}
          >
            <Typography variant="h6" color="error">
              ⚠️ Incident Detected: {incidentDetected}
            </Typography>
            <Typography>
              An incident of type "{incidentDetected}" was detected and
              reported.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant={listening ? "outlined" : "contained"}
          color={listening ? "error" : "primary"}
          onClick={() => setListening(!listening)}
        >
          {listening ? "Stop Listening" : "Start Listening"}
        </Button>
        <Button onClick={() => setIsModalOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AudioIncidentReporter;
