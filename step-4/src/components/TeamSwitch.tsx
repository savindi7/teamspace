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
  teams: Organization[];
  refreshTeams: () => void;
  teamsLoading?: boolean;
}

export default function TeamSwitch({
  teams,
  refreshTeams,
  teamsLoading,
}: TeamSwitchProps) {
  const { data: session, update } = useSession();
  const [loadingTeamId, setLoadingTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTeamSwitch = async (orgId: string) => {
    if (!orgId || !session?.user?.access_token) return;

    setLoadingTeamId(orgId);
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
        throw new Error(data.error || "Failed to switch team");
      }
    } catch (error) {
      console.error("Error switching team:", error);
      setError(
        typeof error === "string" ? error : "Failed to switch team"
      );
    } finally {
      setLoadingTeamId(null);
    }
  };

  return (
    <div className="team-switch-container">
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {teams.length > 0 || teamsLoading ? (
        <List sx={{ marginTop: 5 }}>
          {teams.map((team) => (
            <ListItem
              key={team.id}
              disableGutters
              sx={{
                opacity: loadingTeamId === team.id ? 0.7 : 1,
                pointerEvents: loadingTeamId === team.id ? "none" : "auto",
              }}
            >
              <ListItemText primary={team.name} />
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleTeamSwitch(team.id)}
                disabled={loadingTeamId === team.id}
                endIcon={<TrendingFlat />}
              >
                {loadingTeamId === team.id ? "Switching..." : "Switch"}
              </Button>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          No teams available.
        </Typography>
      )}

      {loadingTeamId && (
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
