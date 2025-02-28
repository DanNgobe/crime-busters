import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs";
import React, { useEffect, useState } from "react";

const AudioToxicityChecker: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [toxicityResults, setToxicityResults] = useState<string[]>([]);
  const recognition = new (window.SpeechRecognition ||
    (window as any).webkitSpeechRecognition)();

  useEffect(() => {
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      checkToxicity(text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };
  }, []);

  const checkToxicity = async (text: string) => {
    toxicity
      .load(0.9)
      .then((model) => {
        model
          .classify(text)
          .then((result) => {
            const toxicLabels = result
              .filter((label) => label.results[0].match)
              .map((label) => label.label);
            setToxicityResults(toxicLabels);
          })
          .catch((error) => {
            console.error("Toxicity check error:", error);
          });
      })
      .catch((error) => {
        console.error("Toxicity model load error:", error);
      });
  };

  const startRecording = () => {
    setRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    setRecording(false);
    recognition.stop();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Audio Toxicity Checker</h2>
      <button
        className={`p-2 rounded ${
          recording ? "bg-red-500" : "bg-blue-500"
        } text-white`}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      <p className="mt-4">
        <strong>Transcript:</strong> {transcript || "No transcript yet"}
      </p>
      <p className="mt-4">
        <strong>Toxicity:</strong>{" "}
        {toxicityResults.length > 0
          ? toxicityResults.join(", ")
          : "No toxicity detected"}
      </p>
    </div>
  );
};

export default AudioToxicityChecker;
