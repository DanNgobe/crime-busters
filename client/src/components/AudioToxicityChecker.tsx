import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs";
import { Button, List, Modal, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;

const AudioToxicityChecker: React.FC<{
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isModalOpen, setIsModalOpen }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [toxicLabels, setToxicLabels] = useState<string[]>([]);

  const checkToxicity = async (text: string) => {
    try {
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

    return () => {
      recognition.stop();
    };
  }, [listening]);

  return (
    <>
      <Modal
        title="Audio Toxicity Checker"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button
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
        {toxicLabels.length > 0 && (
          <div
            style={{
              padding: "10px",
              backgroundColor: "#ffcccc",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <Title level={5} style={{ color: "red" }}>
              ⚠️ Warning: Toxicity Detected
            </Title>
            <List
              bordered
              dataSource={toxicLabels}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </div>
        )}

        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          }}
        >
          <Title level={5}>Transcript:</Title>
          <Text>{transcript || "Start speaking to see the transcript..."}</Text>
        </div>
      </Modal>
    </>
  );
};

export default AudioToxicityChecker;
