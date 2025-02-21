import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

interface DeleteUserConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: (userId: string) => void;
  userId: string;
  userName?: string;
}

const DeleteUserConfirmationModal: React.FC<DeleteUserConfirmationModalProps> = ({
  open,
  onClose,
  onDelete,
  userId,
  userName
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: "8px",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6">Confirm Delete</Typography>
        <Typography sx={{ mt: 2 }}>
          Are you sure you want to delete user <b>{userName}</b>?
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
          <Button color="primary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={() => onDelete(userId)}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteUserConfirmationModal;
