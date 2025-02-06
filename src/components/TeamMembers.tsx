import React from 'react';

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
            <h3>Team Members</h3>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.name?.givenName} ({user.emails?.[0] || "No Email"})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TeamMembers;
