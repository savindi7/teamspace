"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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

export default function TeamSwitch() {
  const { data: session, status, update } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.access_token) {
      fetch("/api/organizations")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setOrganizations(data.organizations || []);
        })
        .catch((err) => {
          console.error("Error fetching organizations:", err);
          setError("Failed to load organizations");
        });
    }
  }, [status, session]);

  const handleOrgSwitch = async (orgId: string) => {
    if (!orgId || !session?.user?.access_token) return;

    setLoading(true);
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
        };

        if (data.id_token) {
          updatedSession.id_token = data.id_token;
        }

        try {
          await update(updatedSession);

          setOrganizations((prev) => [...prev]);
        } catch (updateError) {
          console.error("Error updating session:", updateError);
          throw updateError;
        }
      } else {
        throw new Error(data.error || "Failed to switch organization");
      }
    } catch (error) {
      console.error("Error in handleOrgSwitch:", error);
      setError(
        typeof error === "string" ? error : "Failed to switch organization"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (orgId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleOrgSwitch(orgId);
  };

  return (
    <div className="organization-switch-container">
      {organizations.length > 0 && (
        <>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <List sx={{ marginTop: 5 }}>
            {organizations.map((org) => (
              <ListItem
                key={org.id}
                disableGutters
                sx={{
                  opacity: loading ? 0.7 : 1,
                  pointerEvents: loading ? "none" : "auto",
                }}
              >
                <ListItemText primary={org.name} />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleButtonClick(org.id)}
                  disabled={loading}
                  endIcon={<TrendingFlat />}
                >
                  {loading ? "Switching..." : "Switch"}
                </Button>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {loading && (
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
