import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteUserConfirmationModal from "./DeleteUserConfirmationModal";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: { display: string }[];
}

const MemberList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // Set loading state to true before fetching
      try {
        const response = await fetch("/api/get-users");
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.error || "Failed to fetch users.");

        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load team members.");
      } finally {
        setLoading(false); // Stop loading after fetch completes
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteClick = (userId: string, userName: string | undefined) => {
    setSelectedUser({ id: userId, userName: userName });
    setOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async (userId: string) => {
    try {
      const response = await fetch(`/api/delete-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error("Failed to delete user.");

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setOpenDeleteModal(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user.");
    }
  };

  const showDelete = (userName: string | undefined) => {
    return (
      userName !== session?.user?.email &&
      session?.scopes?.includes("internal_org_user_mgt_delete")
    );
  };

  return (
    <div>
      {error && <Typography color="error">{error}</Typography>}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {users?.map((user) => (
            <ListItem key={user.id}>
              <ListItemText
                primary={
                  <>
                    {user.userName
                      ? user.userName.split("/").pop()
                      : "Unknown User"}
                    &nbsp;
                    {user?.userName?.split("/").pop() ===
                      session?.user?.email && <Chip label="You" size="small" />}
                  </>
                }
                secondary={user.roles?.length ? user.roles[0].display : "No Role"}
              />
              {showDelete(user.userName?.split("/").pop()) && (
                <IconButton onClick={() => handleDeleteClick(user.id, user?.userName?.split("/").pop())} disabled={loading}>
                  <DeleteIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
      )}

      {selectedUser && (
        <DeleteUserConfirmationModal
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onDelete={handleDeleteConfirm}
          userId={selectedUser.id}
          userName={selectedUser.userName}
        />
      )}
    </div>
  );
};

export default MemberList;
