"use client";

import type React from "react";

import { useState } from "react";
import SignUp from "./SignUp";
import {
  Typography,
  Button,
  Container,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import Teams from "./Teams";
import { signIn, useSession } from "next-auth/react";
import Navbar from "./Navbar";

export default function Home() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: session, status } = useSession();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (status === "loading") {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container className="home">
      <Navbar
        session={session}
        handleMenu={handleMenu}
        anchorEl={anchorEl}
        handleClose={handleClose}
      />
      {!session ? (
        <Box mt={3} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => signIn("asgardeo")}
          >
            Sign in
          </Button>
          <Box mt={2}>
            <SignUp />
          </Box>
        </Box>
      ) : (
          <Box margin={3} textAlign="center">
            <Typography variant="body1" gutterBottom>
              Hello {session.user.email} 👋
            </Typography>
            {session.isSubOrg && (
              <Typography variant="body1" gutterBottom component="span">
                You are now signed in to Team: <Chip label={session?.orgName} />
              </Typography>
            )}
            {!session.isSubOrg && <Teams />}
          </Box>
      )}
    </Container>
  );
}
