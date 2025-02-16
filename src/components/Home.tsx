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
import Members from "./Members";
import { signIn, useSession } from "next-auth/react";
import { ArrowBack } from "@mui/icons-material";
import Navbar from "./Navbar";

export default function Home() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: session, update, status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOrgSwitch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!session?.rootOrgId) return;

    const rootOrgId = session.rootOrgId;
    setLoading(true);
    try {
      const response = await fetch("/api/switch-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": Date.now().toString(),
        },
        body: JSON.stringify({
          orgId: rootOrgId,
          accessToken: session.user.access_token,
        }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        const updatedSession = {
          ...session,
          user: {
            ...session.user,
            access_token: data.accessToken,
          },
        };

        if (data.id_token) {
          updatedSession.id_token = data.id_token;
        }

        try {
          await update(updatedSession);
          window.location.reload();
        } catch (updateError) {
          console.error("Error updating session:", updateError);
          throw updateError;
        }
      } else {
        throw new Error(data.error || "Failed to switch organization");
      }
    } catch (error) {
      console.error("Error in handleOrgSwitch:", error);
    } finally {
      setLoading(false);
    }
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
        <Box margin={3}>
          {session.isSubOrg && (
            <Button
              startIcon={<ArrowBack />}
              onClick={handleOrgSwitch}
              disabled={loading}
              variant="text"
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Back to Teams"}
            </Button>
          )}
          <Box textAlign="center">
            <Typography variant="body1" gutterBottom>
              Hello {session.user.email} 👋
            </Typography>
            {session.isSubOrg && (
              <Typography variant="body1" gutterBottom component="span">
                You are now signed in to Team: <Chip label={session?.orgName} />
              </Typography>
            )}
            {session.isSubOrg ? <Members /> : <Teams />}
          </Box>
        </Box>
      )}
    </Container>
  );
}
