// theme.ts
// import { createTheme } from "@mui/material";

// export const getTheme = (darkMode: boolean) =>
//   createTheme({
//     palette: {
//       mode: darkMode ? "dark" : "light",
//       background: {
//         default: darkMode ? "#121212" : "#f4f4f4",
//         paper: darkMode ? "#1e1e1e" : "#fff",
//       },
//     },
//     components: {
//       MuiDrawer: {
//         styleOverrides: {
//           paper: {
//             backgroundColor: darkMode ? "#1e1e1e" : "#fff",
//           },
//         },
//       },
//     },
//   });

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// Create a theme instance for each mode
export const getTheme = (darkMode: boolean) => {
  let theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: !darkMode ? "#2563eb" : "#3b82f6", // Blue
        light: !darkMode ? "#60a5fa" : "#93c5fd",
        dark: !darkMode ? "#1d4ed8" : "#2563eb",
        contrastText: "#ffffff",
      },
      secondary: {
        main: !darkMode ? "#8b5cf6" : "#a78bfa", // Purple
        light: !darkMode ? "#a78bfa" : "#c4b5fd",
        dark: !darkMode ? "#7c3aed" : "#8b5cf6",
        contrastText: "#ffffff",
      },
      background: {
        default: !darkMode ? "#f8fafc" : "#0f172a",
        paper: !darkMode ? "#ffffff" : "#1e293b",
      },
      text: {
        primary: !darkMode ? "#1e293b" : "#f8fafc",
        secondary: !darkMode ? "#64748b" : "#94a3b8",
      },
      error: {
        main: "#ef4444",
      },
      warning: {
        main: "#f59e0b",
      },
      info: {
        main: "#0ea5e9",
      },
      success: {
        main: "#10b981",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 700,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 600,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            padding: "8px 16px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
          contained: {
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: !darkMode
              ? "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: !darkMode
              ? "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: !darkMode ? "#ffffff" : "#1e293b",
            borderRight: !darkMode ? "1px solid #e2e8f0" : "1px solid #334155",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: "4px 8px",
            "&.Mui-selected": {
              backgroundColor: !darkMode
                ? "rgba(37, 99, 235, 0.1)"
                : "rgba(59, 130, 246, 0.2)",
              "&:hover": {
                backgroundColor: !darkMode
                  ? "rgba(37, 99, 235, 0.15)"
                  : "rgba(59, 130, 246, 0.25)",
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiContainer: {
        defaultProps: {
          maxWidth: false, // disables default maxWidth like "lg"
        },
        styleOverrides: {
          root: {
            width: "95%",
            paddingLeft: "16px",
            paddingRight: "16px",
            marginLeft: "auto",
            marginRight: "auto",
            "@media (min-width: 1440px)": {
              maxWidth: "1400px",
            },
          },
        },
      },
    },
  });

  // Make typography responsive
  theme = responsiveFontSizes(theme);

  return theme;
};
