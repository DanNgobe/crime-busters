import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import React, { useEffect, useRef, useState } from "react";

type Keypoint = {
  x: number;
  y: number;
  score: number;
  name: string;
};

const LEFT_ARM = ["left_shoulder", "left_elbow", "left_wrist"];
const RIGHT_ARM = ["right_shoulder", "right_elbow", "right_wrist"];
const LEFT_LEG = ["left_hip", "left_knee", "left_ankle"];
const RIGHT_LEG = ["right_hip", "right_knee", "right_ankle"];

const ALL_LIMBS = {
  leftArm: LEFT_ARM,
  rightArm: RIGHT_ARM,
  leftLeg: LEFT_LEG,
  rightLeg: RIGHT_LEG,
};

const MAX_HISTORY = 30;
const ENERGY_THRESHOLD = 300000;

const MoveNetDetectorLimbSplit: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [keypoints, setKeypoints] = useState<Record<string, Keypoint[]>>({});
  const [energy, setEnergy] = useState<Record<string, number>>({});
  const [violentLimb, setViolentLimb] = useState<string | null>(null);

  const limbHistories = useRef<Record<string, Keypoint[][]>>({
    leftArm: [],
    rightArm: [],
    leftLeg: [],
    rightLeg: [],
  });

  useEffect(() => {
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    };

    const extractLimbKeypoints = (allKeypoints: Keypoint[], names: string[]) =>
      allKeypoints.filter((kp) => names.includes(kp.name));

    const calculateEnergy = (history: Keypoint[][]) => {
      let energy = 0;
      for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1];
        const curr = history[i];
        for (let j = 0; j < prev.length; j++) {
          const dx = curr[j].x - prev[j].x;
          const dy = curr[j].y - prev[j].y;
          energy += dx * dx + dy * dy;
        }
      }
      return energy;
    };

    const runDetector = async () => {
      await tf.setBackend("webgl");
      await setupCamera();

      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      );

      const detect = async () => {
        if (videoRef.current) {
          const poses = await detector.estimatePoses(videoRef.current);
          if (poses.length > 0) {
            const allKeypoints = poses[0].keypoints as Keypoint[];
            const limbKeypoints: Record<string, Keypoint[]> = {};
            const limbEnergies: Record<string, number> = {};
            let detectedViolent: string | null = null;

            for (const limb in ALL_LIMBS) {
              const points = extractLimbKeypoints(
                allKeypoints,
                ALL_LIMBS[limb as keyof typeof ALL_LIMBS]
              );
              limbKeypoints[limb] = points;

              // Update history
              const history = limbHistories.current[limb];
              history.push(points);
              if (history.length > MAX_HISTORY) history.shift();

              // Calculate energy
              const e = calculateEnergy(history);
              limbEnergies[limb] = e;

              if (e > ENERGY_THRESHOLD) detectedViolent = limb;
            }

            setKeypoints(limbKeypoints);
            setEnergy(limbEnergies);
            setViolentLimb(detectedViolent);
          }
        }
        requestAnimationFrame(detect);
      };

      detect();
    };

    runDetector();
  }, []);

  const renderLimb = (label: string, points: Keypoint[], energyVal: number) => (
    <div key={label}>
      <h4>
        {label} – Energy: {energyVal.toFixed(2)}{" "}
        {energyVal > ENERGY_THRESHOLD && "🚨"}
      </h4>
      <ul>
        {points.map((point, i) => (
          <li key={i}>
            {point.name}: ({point.x.toFixed(1)}, {point.y.toFixed(1)}) - Score:{" "}
            {point.score.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      <video
        ref={videoRef}
        width="640"
        height="480"
        style={{
          display: "block",
          border: violentLimb ? "4px solid red" : "4px solid green",
        }}
      />
      <h3>
        {violentLimb
          ? `🚨 Violent motion detected in: ${violentLimb}`
          : "✅ No violent motion"}
      </h3>
      {Object.entries(keypoints).map(([limb, points]) =>
        renderLimb(limb, points, energy[limb] || 0)
      )}
    </div>
  );
};

export default MoveNetDetectorLimbSplit;
