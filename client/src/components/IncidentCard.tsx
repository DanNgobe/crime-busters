import { AlertOutlined, CarOutlined, FireOutlined } from "@ant-design/icons";
import { Card, Tag, Typography } from "antd";
import React from "react";

const { Title, Text } = Typography;

const typeIcons: Record<string, React.ReactNode> = {
  Fire: <FireOutlined style={{ color: "red" }} />,
  Accident: <CarOutlined style={{ color: "orange" }} />,
  Crime: <AlertOutlined style={{ color: "blue" }} />,
};

const statusColors: Record<string, string> = {
  pending: "default",
  "in-progress": "orange",
  resolved: "green",
};

interface IncidentCardProps {
  title: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  type: "Fire" | "Accident" | "Crime";
}

const IncidentCard: React.FC<IncidentCardProps> = ({
  title,
  description,
  status,
  type,
}) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Title level={5}>
        {typeIcons[type]} {title}
      </Title>
      <Text>{description}</Text>
      <Tag color={statusColors[status]} style={{ marginTop: 8 }}>
        {status.toUpperCase()}
      </Tag>
    </Card>
  );
};

export default IncidentCard;
