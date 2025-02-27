import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

const AddTeamModal = ({ refreshTeams }: { refreshTeams: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const teamName = formData.get("teamName") as string;
    const teamDescription = formData.get("teamDescription") as string;

    try {
      const response = await fetch("/api/add-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamName, teamDescription }),
      });

      if (response.ok) {
        handleClose();
        refreshTeams()
      } else {
        console.error("Failed to add team");
      }
    } catch (error) {
      console.error("Error adding team:", error);
    } finally {
    setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpen}
      >
        Add Team
      </Button>
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle>Add New Team</DialogTitle>
        <Box component="form" onSubmit={handleSave}>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            label="Team Name"
            type="text"
            fullWidth
            name="teamName"
          />
          <TextField
            margin="dense"
            label="Team Description"
            type="text"
            fullWidth
            name="teamDescription"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={loading} loading={loading}>
            Add Team
          </Button>
        </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default AddTeamModal;
