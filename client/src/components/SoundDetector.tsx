import * as tf from "@tensorflow/tfjs";
import { Button, List, Modal, Spin, Typography } from "antd";
import React, { useRef, useState } from "react";

const { Title, Text } = Typography;

const MODEL_URL = "https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1";
const CLASS_MAP_URL = "yamnet_class_map.csv"; // Ensure this file is accessible

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
      // Load the YAMNet model
      const model = await tf.loadGraphModel(MODEL_URL, { fromTFHub: true });

      // Parse class labels from CSV
      const classResponse = await fetch(CLASS_MAP_URL);
      const classText = await classResponse.text();
      const classes = classText
        .split("\r\n")
        .slice(1)
        .map((line) =>
          line
            .split(",")
            .slice(2)
            .join(",")
            .replace(/(\/|"|\\)/g, "")
        );

      // Decode audio
      const audioBuffer = await audioBlob.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioData = await audioCtx.decodeAudioData(audioBuffer);
      const waveform = tf.tensor(audioData.getChannelData(0));

      // Run prediction
      const [scores] = model.predict(waveform) as tf.Tensor[];
      const top3 = await tf.topk(scores.mean(0), 3, true).indices.array();

      // Get class names
      //@ts-ignore
      const topClasses = top3.map((i: number) => classes[i]);
      setPredictions(topClasses);
      setLoading(false);
    } catch (error) {
      console.error("Error in classification:", error);
    }
  };

  return (
    <>
      {/* Modal for Audio Recording */}
      <Modal
        title="Sound Detector"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <>
            <Button
              type={recording ? "default" : "primary"}
              danger={recording}
              onClick={recording ? stopRecording : startRecording}
            >
              {recording ? "Stop Recording" : "Start Recording"}
            </Button>
            ,
            <Button key="close" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </>
        } // No default footer buttons
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          {audioURL && (
            <div style={{ marginTop: "20px" }}>
              <audio controls src={audioURL} />
              <Text style={{ display: "block", marginTop: "10px" }}>
                Recorded Audio Preview 🎤
              </Text>
            </div>
          )}

          {loading && (
            <Spin
              size="large"
              style={{ display: "block", marginBottom: "10px" }}
            />
          )}

          {predictions.length > 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "10px",
                backgroundColor: "#f0f0f0",
                borderRadius: "5px",
              }}
            >
              <Title level={5}>Top 3 Predictions:</Title>
              <List
                bordered
                dataSource={predictions}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default SoundDetector;
