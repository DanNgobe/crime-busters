import { useEffect, useRef, useState } from "react";

type RecordingStatus = "idle" | "recording" | "processing";
type AudioData = Blob | null;

const AudioRecorder = () => {
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorder.current) {
        mediaRecorder.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    setResult(null); // Clear previous results
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        audioChunks.current = [];

        // Ensure uploadAudio is called
        uploadAudio(audioBlob);
      };

      mediaRecorder.current.start();
      setRecordingStatus("recording");
    } catch (err) {
      setError("Error accessing microphone. Please check permissions.");
      setRecordingStatus("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setRecordingStatus("processing");
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    console.log("Uploading audio...");
    setRecordingStatus("processing");

    try {
      const formData = new FormData();
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });
      formData.append("audio", audioFile);

      const response = await fetch("http://localhost:5000/classify-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Classification failed");

      const data = await response.json();
      setResult(data.classification);
    } catch (err) {
      console.error("Error processing audio:", err);
      setError("Error processing audio. Please try again.");
    } finally {
      setRecordingStatus("idle");
    }
  };

  return (
    <div className="audio-recorder">
      <h2>Audio Recorder</h2>

      {error && <div className="error">{error}</div>}

      <div className="controls">
        {recordingStatus === "idle" && (
          <button
            onClick={startRecording}
            disabled={recordingStatus !== "idle"}
          >
            Start Recording
          </button>
        )}

        {recordingStatus === "recording" && (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
      </div>

      {audioUrl && (
        <div className="audio-preview">
          <audio controls src={audioUrl} />
        </div>
      )}

      {recordingStatus === "processing" && <p>Processing...</p>}

      {result && (
        <div className="result">
          <h3>Analysis Result:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
