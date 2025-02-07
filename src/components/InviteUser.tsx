import { FormEvent, useEffect, useState } from "react";
import TeamMembers from "./TeamMembers";
import {
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

interface User {
  id: string;
  name: { givenName: string };
  emails: string[];
}

const InviteUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState<{ id: string; displayName: string }[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/get-users");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch users.");

        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load team members.");
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/get-roles");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch roles.");

        setRoles(data.roles || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchUsers();
    fetchRoles();
  }, []);

  const handleInvite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, selectedRoleId: role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invite failed.");

      setMessage("User invited successfully!");

      // Update users list with the new user
      setUsers((prevUsers) => [
        ...prevUsers,
        { id: data.id, name: { givenName: email }, emails: [email] },
      ]);
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
    <Container>
      <form onSubmit={handleInvite}>
        <TextField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="User Email"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          fullWidth
          margin="normal"
          required
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          displayEmpty
          fullWidth
          margin="normal"
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
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Invite User"}
        </Button>
        {message && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </form>
      <TeamMembers users={users} />
    </Container>
  );
};

export default InviteUser;
