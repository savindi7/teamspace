"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import { Organization } from "@/types/organization";
import { TrendingFlat } from "@mui/icons-material";

interface TeamSwitchProps {
  organizations: Organization[];
  refreshTeams: () => void;
  orgsLoading?: boolean;
}

export default function TeamSwitch({
  organizations,
  refreshTeams,
  orgsLoading,
}: TeamSwitchProps) {
  const { data: session, update } = useSession();
  const [loadingOrgId, setLoadingOrgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOrgSwitch = async (orgId: string) => {
    if (!orgId || !session?.user?.access_token) return;

    setLoadingOrgId(orgId);
    setError(null);

    try {
      const response = await fetch("/api/switch-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": Date.now().toString(),
        },
        body: JSON.stringify({ orgId, accessToken: session.user.access_token }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        const updatedSession = {
          ...session,
          user: {
            ...session.user,
            access_token: data.accessToken,
          },
          id_token: data.id_token || session.id_token,
        };

        await update(updatedSession);
        refreshTeams();
      } else {
        throw new Error(data.error || "Failed to switch organization");
      }
    } catch (error) {
      console.error("Error switching organization:", error);
      setError(
        typeof error === "string" ? error : "Failed to switch organization"
      );
    } finally {
      setLoadingOrgId(null);
    }
  };

  return (
    <div className="organization-switch-container">
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {organizations.length > 0 || orgsLoading ? (
        <List sx={{ marginTop: 5 }}>
          {organizations.map((org) => (
            <ListItem
              key={org.id}
              disableGutters
              sx={{
                opacity: loadingOrgId === org.id ? 0.7 : 1,
                pointerEvents: loadingOrgId === org.id ? "none" : "auto",
              }}
            >
              <ListItemText primary={org.name} />
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleOrgSwitch(org.id)}
                disabled={loadingOrgId === org.id}
                endIcon={<TrendingFlat />}
              >
                {loadingOrgId === org.id ? "Switching..." : "Switch"}
              </Button>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          No organizations available.
        </Typography>
      )}

      {loadingOrgId && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress />
        </div>
      )}
    </div>
  );
}
