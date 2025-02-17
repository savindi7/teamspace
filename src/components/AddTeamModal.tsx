import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

const AddTeamModal = ({ refreshTeams }: { refreshTeams: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = async () => {
    setLoading(true);
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
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            label="Team Name"
            type="text"
            fullWidth
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Team Description"
            type="text"
            fullWidth
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained" disabled={loading} loading={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTeamModal;
