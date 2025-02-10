import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

interface User {
    id: string;
    name: { givenName: string };
    emails: string[];
}

const MemberList: React.FC = () => {
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
      
          fetchUsers();
        }, []);

    return (
        <div>
            <Typography variant="h6">Team Members</Typography>
            <List>
                {users?.map((user) => (
                    <ListItem key={user.id}>
                        <ListItemText
                            primary={user.userName}
                            secondary={user.roles[0]?.display}
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default MemberList;
