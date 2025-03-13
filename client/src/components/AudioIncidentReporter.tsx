import { Button, message, Modal, Spin, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useCreateMutation } from "../hooks";
import useGeolocation from "../hooks/useGeolocation";
import { IncidentInput } from "../types";

const { Title, Text } = Typography;

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
  1. The **type** of incident (choose from: "Crime", "Fire", "Pothole", "Accident", "Flooding", "Medical Emergency", "Earthquake", "Other").
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
      console.log("Gemini Raw Response:", responseText);

      // Try to extract JSON if response includes extra text
      let jsonStart = responseText.indexOf("{");
      let jsonEnd = responseText.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        responseText = responseText.substring(jsonStart, jsonEnd + 1);
      }

      try {
        const parsedResponse = JSON.parse(responseText);

        // Ensure required fields exist
        if (parsedResponse.incident_type && parsedResponse.urgency) {
          setIncidentDetected(parsedResponse.incident_type);
          reportIncident(createIncidentPayload(parsedResponse));
        } else {
          console.error("Invalid JSON format:", parsedResponse);
        }
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
      }
    } catch (error) {
      console.error("Error classifying speech:", error);
      message.error("Error communicating with Gemini API");
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
    urgency: data.urgency, // Now dynamically assigned based on AI response
    latitude: userLocation?.[0] ?? 0,
    longitude: userLocation?.[1] ?? 0,
    status: "pending",
    user_id: "user-id-123",
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
      // Classify speech here would be be better but we dont have too much gemini credits
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
    <Modal
      title="Audio Incident Reporter"
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={[
        <Button
          key="start"
          type={listening ? "default" : "primary"}
          danger={listening}
          onClick={() => setListening(!listening)}
        >
          {listening ? "Stop Listening" : "Start Listening"}
        </Button>,
        <Button key="close" onClick={() => setIsModalOpen(false)}>
          Close
        </Button>,
      ]}
    >
      {loading && (
        <Spin size="large" style={{ display: "block", marginBottom: "10px" }} />
      )}

      <div
        style={{
          marginBottom: "10px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "5px",
        }}
      >
        <Title level={5}>Transcript:</Title>
        <Text>{transcript || "Start speaking to see the transcript..."}</Text>
      </div>

      {incidentDetected && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#ffcccc",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        >
          <Title level={5} style={{ color: "red" }}>
            ⚠️ Incident Detected: {incidentDetected}
          </Title>
          <Text>
            An incident of type "{incidentDetected}" was detected and reported.
          </Text>
        </div>
      )}
    </Modal>
  );
};

export default AudioIncidentReporter;
