import {
  AccountCircle,
  Brightness4,
  Brightness7,
  Dashboard,
  ListAlt,
  Logout,
  Report,
  Security,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useTheme } from "../context/ThemeContext";

interface Props {
  children: ReactNode;
  isAdmin?: boolean;
}

const drawerWidth = 240;

const Layout: React.FC<Props> = ({ children, isAdmin = true }) => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        color="default"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 40, width: 40, mr: 2 }}
          />
          <Typography variant="h6" noWrap>
            Crime Busters
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <Box>
          <Toolbar />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/")}>
                <ListItemIcon>
                  <Dashboard color="primary" />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/my-reports")}>
                <ListItemIcon>
                  <Report color="error" />
                </ListItemIcon>
                <ListItemText primary="My Reports" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/safety-tips")}>
                <ListItemIcon>
                  <Security color="success" />
                </ListItemIcon>
                <ListItemText primary="Safety Tips" />
              </ListItemButton>
            </ListItem>
            {isAdmin && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding>
                  <ListItemButton onClick={() => navigate("/reports")}>
                    <ListItemIcon>
                      <ListAlt color="info" />
                    </ListItemIcon>
                    <ListItemText primary="View Reports" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => navigate("/admin")}>
                    <ListItemIcon>
                      <Security color="warning" />
                    </ListItemIcon>
                    <ListItemText primary="Admin Panel" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={toggleDarkMode}>
                <ListItemIcon>
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </ListItemIcon>
                <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        <Box>
          <Divider />
          <List>
            <ListItem
              sx={{
                display: "flex",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccountCircle sx={{ mr: 1 }} />
                <Typography variant="body2">User</Typography>
              </Box>
              <IconButton size="small" color="inherit">
                <Logout />
              </IconButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          color: "text.primary",
          p: 3,
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
