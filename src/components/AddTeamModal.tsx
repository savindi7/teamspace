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

const AddTeamModal = () => {
  const [isOpen, setIsOpen] = useState(open);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

const handleSave = async () => {

    try {
        const response = await fetch("/api/add-organization", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({teamName, teamDescription}),
        });

        if (response.ok) {
            console.log("Team added successfully");
            handleClose();
        } else {
            console.error("Failed to add team");
        }
    } catch (error) {
        console.error("Error adding team:", error);
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
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTeamModal;
