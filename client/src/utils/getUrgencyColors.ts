// Helpers
export const getUrgencyColor = (urgency: string, theme: any): string => {
  switch (urgency) {
    case "critical":
      return theme.palette.error.main;
    case "high":
      return theme.palette.warning.main;
    case "medium":
      return theme.palette.info.main;
    default:
      return theme.palette.grey[500];
  }
};

export const getUrgencyChipColor = (
  urgency: string
): "default" | "info" | "warning" | "error" => {
  switch (urgency) {
    case "critical":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "default";
  }
};
