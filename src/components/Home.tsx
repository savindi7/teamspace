"use client";

import { useState } from "react";
import SignUp from "./SignUp";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Container,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Logout from "@mui/icons-material/Logout";
import Teams from "./Teams";
import Members from "./Members";
import { signIn, signOut } from "next-auth/react";

export default function Home({ session }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      const data = await res.json();

      if (data.logoutUrl) {
        await signOut({ redirect: false });

        window.location.href = data.logoutUrl;
      } else {
        console.error("Logout URL not found.");
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <Container className="home">
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Asgardeo x Next.js B2B Sample App
          </Typography>
          {session && (
            <div>
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  alt={session.user.email}
                  src="/static/images/avatar/1.jpg"
                />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleSignOut()}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      {!session ? (
        <Box mt={3} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={() => signIn("asgardeo")}
          >
            Sign in
          </Button>
          <Box mt={2}>
            <SignUp />
          </Box>
        </Box>
      ) : (
        <Box mt={3} textAlign="center">
          <Typography variant="body1">Hello {session?.user?.email}</Typography>
          <Typography variant="body1">
            You are now signed in to Team: {session?.orgName}
          </Typography>
          {session?.isSubOrg ? <Members /> : <Teams />}
        </Box>
      )}
    </Container>
  );
}
