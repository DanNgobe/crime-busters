import { Button, Card, Spin, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useCreateMutation } from "../hooks";
import useGeolocation from "../hooks/useGeolocation";
import { IncidentInput } from "../types";

const { Text } = Typography;

// Keywords to detect incidents
const INCIDENT_KEYWORDS = [
  "help",
  "accident",
  "fire",
  "pothole",
  "crime",
  "flooding",
];

const VoiceIncidentReporter: React.FC = () => {
  const userLocation = useGeolocation();
  const { mutate: reportIncident, isPending } = useCreateMutation({
    resource: "incidents",
    onSuccessMessage: "Incident reported successfully",
    onSuccessCallback: () => setDetectedText("Incident reported successfully!"),
  });

  const [recording, setRecording] = useState(false);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const recognition = new (window.SpeechRecognition ||
    (window as any).webkitSpeechRecognition)();

  useEffect(() => {
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setDetectedText(text);
      console.log("Detected text:", text);
      processIncident(text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };
  }, []);

  const processIncident = (text: string) => {
    const matchedKeyword = INCIDENT_KEYWORDS.find((keyword) =>
      text.includes(keyword)
    );
    if (!matchedKeyword) {
      setDetectedText("No incident detected.");
      return;
    }

    const newIncident: IncidentInput = {
      type: matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1), // Capitalize
      title: `Reported ${matchedKeyword}`,
      description: `User said: "${text}"`,
      urgency: "high",
      latitude: userLocation?.[0] ?? 0,
      longitude: userLocation?.[1] ?? 0,
      status: "pending",
      user_id: "user-id-123",
    };

    reportIncident(newIncident);
  };

  const toggleRecording = () => {
    if (recording) {
      recognition.stop();
      setRecording(false);
    } else {
      setDetectedText(null);
      recognition.start();
      setRecording(true);
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", paddingTop: "50px" }}
    >
      <Card style={{ width: 400, textAlign: "center" }}>
        <h3>Report an Incident</h3>
        <Button
          type={recording ? "danger" : "primary"}
          onClick={toggleRecording}
          block
        >
          {recording ? "Listening..." : "Press to Report Incident"}
        </Button>

        {detectedText && (
          <Text style={{ display: "block", marginTop: "20px" }}>
            {isPending ? <Spin /> : detectedText}
          </Text>
        )}
      </Card>
    </div>
  );
};

export default VoiceIncidentReporter;
