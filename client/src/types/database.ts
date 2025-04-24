export type Incident = {
  id: number;
  userId?: string;
  type: string;
  urgency: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type User = {
  id: string;
  role: "public" | "law_enforcement";
  isBlocked: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type IncidentInput = {
  id?: number;
  userId?: string;
  type: string;
  urgency: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
};

export type UserInput = {
  id?: string;
  role: "public" | "law_enforcement";
  isBlocked: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};
