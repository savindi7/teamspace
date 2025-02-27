import { FormEvent, useEffect, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem, Typography, CircularProgress } from "@mui/material";
import { Add } from "@mui/icons-material";

const AddMemberModal = () => {
    const [open, setOpen] = useState(false);
    const [roles, setRoles] = useState<{ id: string; displayName: string }[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch("/api/get-roles");
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Failed to fetch roles.");

                setRoles(data.roles || []);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };

        fetchRoles();
    }, []);

    const handleInvite = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;

        try {
            const response = await fetch("/api/invite-member", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, selectedRoleId: role }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Invite failed.");

            setMessage("User invited successfully!");
        } catch (error) {
            if (error instanceof Error) {
                setMessage(`Error: ${error.message}`);
                console.error("Invite Error:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<Add />}>
                Invite Member
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Invite Member</DialogTitle>
                <Box component="form" onSubmit={handleInvite}>
                    <DialogContent>
                        <TextField
                            type="email"
                            name="email"
                            label="User Email"
                            fullWidth
                            margin="normal"
                            required
                        />
                        <Select
                            name="role"
                            displayEmpty
                            fullWidth
                            margin="dense"
                            required
                        >
                            <MenuItem value="">
                                <em>Select Role</em>
                            </MenuItem>
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.displayName}
                                </MenuItem>
                            ))}
                        </Select>
                        {message && (
                            <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
                                {message}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" type="submit" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Invite User"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </div>
    );
};

export default AddMemberModal;
