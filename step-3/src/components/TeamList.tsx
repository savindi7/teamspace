"use client";

import {
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Organization } from "@/types/organization";

interface TeamListProps {
  teams: Organization[];
  teamsLoading?: boolean;
}

export default function TeamList({
  teams,
  teamsLoading,
}: TeamListProps) {

  return (
    <div className="team-list-container">
      {teams?.length > 0 || teamsLoading ? (
        <List sx={{ marginTop: 5 }}>
          {teams.map((org) => (
            <ListItem
              key={org.id}
              disableGutters
            >
              <ListItemText primary={org.name} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          No teams available.
        </Typography>
      )}

      {teamsLoading && (
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
