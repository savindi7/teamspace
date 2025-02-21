import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <Box
            sx={{ width: 50 }}
            marginRight={2}
            component="img"
            src="https://github.com/user-attachments/assets/f0e19431-5c27-48e9-bf0a-1125a2b45b2c"
            alt="Menu Icon"
          ></Box>
        </IconButton>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Teamspace
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
