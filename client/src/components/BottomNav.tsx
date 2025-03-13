import { BellOutlined, SoundOutlined, WechatOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import React from "react";
import AudioIncidentReporter from "./AudioIncidentReporter";
import AudioToxicityChecker from "./AudioToxicityChecker";
import SoundDetector from "./SoundDetector";

const BottomNav: React.FC = () => {
  const [isToxicityModalOpen, setIsToxicityModalOpen] = React.useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = React.useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = React.useState(false);

  return (
    <div style={navContainerStyle}>
      <Flex justify="space-around" align="center" style={navStyle}>
        <Button
          type="text"
          icon={<SoundOutlined style={iconStyle} />}
          onClick={() => setIsSoundModalOpen(true)}
        />
        <Button
          type="text"
          icon={<BellOutlined style={iconStyle} />}
          onClick={() => setIsIncidentModalOpen(true)}
          style={centerButtonStyle}
        />
        <Button
          type="text"
          icon={<WechatOutlined style={iconStyle} />}
          onClick={() => setIsToxicityModalOpen(true)}
        />
      </Flex>
      <AudioToxicityChecker
        isModalOpen={isToxicityModalOpen}
        setIsModalOpen={setIsToxicityModalOpen}
      />
      <SoundDetector
        isModalOpen={isSoundModalOpen}
        setIsModalOpen={setIsSoundModalOpen}
      />
      <AudioIncidentReporter
        isModalOpen={isIncidentModalOpen}
        setIsModalOpen={setIsIncidentModalOpen}
      />
    </div>
  );
};

const navContainerStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  background: "#fff",
  boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
  padding: "8px 0",
};

const navStyle: React.CSSProperties = {
  maxWidth: "500px",
  margin: "0 auto",
};

const iconStyle: React.CSSProperties = {
  fontSize: "24px",
  color: "#555",
};

const centerButtonStyle: React.CSSProperties = {
  backgroundColor: "#ff4d4f",
  borderColor: "#ff4d4f",
  boxShadow: "0 4px 8px rgba(255, 77, 79, 0.4)",
  transform: "translateY(-12px)", // Makes it pop up
};

export default BottomNav;
