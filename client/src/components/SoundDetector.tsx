import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import * as tf from "@tensorflow/tfjs";
import React, { useRef, useState } from "react";

const MODEL_URL = "https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1";
const CLASS_MAP_URL = "/yamnet_classes.json"; // Ensure this file is accessible

const SoundDetector: React.FC<{
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isModalOpen, setIsModalOpen }) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);
        classifyAudio(audioBlob);
      };

      mediaRecorder.start();
      setAudioURL(null);
      setPredictions([]);
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const classifyAudio = async (audioBlob: Blob) => {
    console.log("Classifying audio...");
    setLoading(true);
    try {
      await tf.ready(); // Ensure TensorFlow is initialized
      const model = await tf.loadGraphModel(MODEL_URL, { fromTFHub: true });

      const classResponse = await fetch(CLASS_MAP_URL);
      const classJson = await classResponse.json();
      const classes: string[] = classJson.map(
        (entry: { index: number; display_name: string }) => entry.display_name
      );

      const audioBuffer = await audioBlob.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioData = await audioCtx.decodeAudioData(audioBuffer);
      const waveform = tf.tensor(audioData.getChannelData(0));

      const [scores] = model.predict(waveform) as tf.Tensor[];
      const top3 = tf.topk(scores.mean(0), 3, true).indices.arraySync();

      const topClasses = Array.isArray(top3)
        ? (top3 as number[]).map((i: number) => classes[i] || `Unknown (${i})`)
        : [];

      console.log("Top 3 classes:", topClasses);
      setPredictions(topClasses);
      setLoading(false);
    } catch (error) {
      console.error("Error in classification:", error);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Sound Detector</DialogTitle>
      <DialogContent dividers>
        <div style={{ textAlign: "center", padding: "20px" }}>
          {audioURL && (
            <div style={{ marginTop: 20 }}>
              <audio controls src={audioURL} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Recorded Audio Preview 🎤
              </Typography>
            </div>
          )}

          {loading && <CircularProgress sx={{ mt: 2, mb: 2 }} />}

          {predictions.length > 0 && (
            <div
              style={{
                marginTop: 20,
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Typography variant="h6">Top 3 Predictions:</Typography>
              <List>
                {predictions.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          variant={recording ? "outlined" : "contained"}
          color={recording ? "error" : "primary"}
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </Button>
        <Button onClick={() => setIsModalOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SoundDetector;
