import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Typography,
  useTheme,
} from "@mui/material";
import * as toxicity from "@tensorflow-models/toxicity";
import * as tf from "@tensorflow/tfjs";
import React, { useEffect, useState } from "react";

const AudioToxicityChecker: React.FC<{
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isModalOpen, setIsModalOpen }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [toxicLabels, setToxicLabels] = useState<string[]>([]);
  const theme = useTheme();

  const checkToxicity = async (text: string) => {
    try {
      await tf.ready(); // ✅ Wait for TensorFlow.js to be ready
      //@ts-ignore
      const model = await toxicity.load(0.9);
      const result = await model.classify(text);
      const detectedToxicLabels = result
        .filter((label) => label.results[0].match)
        .map((label) => label.label);

      setToxicLabels((prev) => [...prev, ...detectedToxicLabels]);
      console.log("Toxicity check result:", detectedToxicLabels);
    } catch (error) {
      console.error("Toxicity check error:", error);
    }
  };

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
          checkToxicity(finalTranscript);
        }
      }
      setTranscript((prev) => prev + finalTranscript);
    };

    recognition.onresult = handleResult;

    if (listening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [listening]);

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Audio Toxicity Checker</DialogTitle>
      <DialogContent dividers>
        {toxicLabels.length > 0 && (
          <Box
            mb={2}
            p={2}
            borderRadius={2}
            sx={{ backgroundColor: theme.palette.error.light }}
          >
            <Typography variant="h6" color="error">
              ⚠️ Warning: Toxicity Detected
            </Typography>
            <List>
              {toxicLabels.map((label, index) => (
                <ListItem key={index}>{label}</ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box mt={2} p={2} borderRadius={2}>
          <Typography variant="h6">Transcript:</Typography>
          <Typography>
            {transcript || "Start speaking to see the transcript..."}
          </Typography>
        </Box>
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

export default AudioToxicityChecker;
