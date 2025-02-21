import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { data: session } = useSession();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Profile</DialogTitle>
      <DialogContent>
        <Typography variant="body1"><b>Username:</b> {session?.user?.email}</Typography>
        <Typography variant="body1">
          <b>First Name:</b> {session?.user?.firstName}
        </Typography>
        <Typography variant="body1">
          <b>Last Name:</b> {session?.user?.lastName}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileModal;
