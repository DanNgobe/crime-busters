export type Incident = {
  id: number;
  userId: string;
  type: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  urgency: "low" | "medium" | "high" | "critical";
  status: "pending" | "in-progress" | "resolved";
  createdAt: string;
  updatedAt: string;
};

export type IncidentInput = {
  type: string;
  title: string;
  user_id: string;
  description: string;
  latitude: number;
  longitude: number;
  urgency: "low" | "medium" | "high" | "critical";
  status: "pending";
};
