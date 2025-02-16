import React from 'react';
import { Container, Typography } from '@mui/material';
import AddTeamModal from './AddTeamModal';
import TeamSwitch from './TeamSwitch';

const Teams: React.FC = () => {

    return (
        <Container>
            <Typography variant="h4" margin={3}>
                Teams
            </Typography>
            <AddTeamModal 
             />
             <TeamSwitch />
        </Container>
    );
};

export default Teams;
