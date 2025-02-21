import React, { useState, useEffect } from "react";
import { Container, Typography } from '@mui/material';
import AddTeamModal from './AddTeamModal';
import TeamSwitch from './TeamSwitch';
import { Organization } from "@/types/organization";

const Teams: React.FC = () => {

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/organizations");
          const data = await response.json();
          setOrganizations(data.organizations || []);
        } catch (error) {
          console.error("Error fetching organizations:", error);
        } finally {
            setLoading(false);
            }
      };
    
      useEffect(() => {
        fetchOrganizations();
      }, []);

    return (
        <Container>
            <Typography variant="h4" margin={3}>
                Teams
            </Typography>
            <AddTeamModal refreshTeams={fetchOrganizations} />
            <TeamSwitch organizations={organizations} refreshTeams={fetchOrganizations} orgsLoading={loading} />
        </Container>
    );
};

export default Teams;
