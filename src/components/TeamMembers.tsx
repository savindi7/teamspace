import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

interface User {
    id: string;
    name: { givenName: string };
    emails: string[];
}

interface TeamMembersProps {
    users: User[];
}

const TeamMembers: React.FC<TeamMembersProps> = ({ users }) => {
    return (
        <div>
            <Typography variant="h6">Team Members</Typography>
            <List>
                {users.map((user) => (
                    <ListItem key={user.id}>
                        <ListItemText
                            primary={user.name?.givenName}
                            secondary={user.emails?.[0] || "No Email"}
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default TeamMembers;
