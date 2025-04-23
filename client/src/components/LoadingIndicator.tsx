import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingIndicator: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="primary"
      px={2}
    >
      <CircularProgress size={60} thickness={5} />
      <Typography variant="h6" mt={2}>
        Loading...
      </Typography>
    </Box>
  );
};

export default LoadingIndicator;
