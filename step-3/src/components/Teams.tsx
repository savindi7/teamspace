import React, { useState, useEffect } from "react";
import { Container, Typography } from '@mui/material';
import AddTeamModal from './AddTeamModal';
import TeamList from './TeamList';
import { Organization } from "@/types/organization";
import { useSession } from "next-auth/react";

const Teams: React.FC = () => {

    const [teams, setTeams] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    const fetchTeams = async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/organizations");
          const data = await response.json();
          setTeams(data.organizations || []);
        } catch (error) {
          console.error("Error fetching teams:", error);
        } finally {
            setLoading(false);
            }
      };
    
      useEffect(() => {
        fetchTeams();
      }, []);

    return (
        <Container>
            <Typography variant="h4" margin={3}>
                Teams
            </Typography>
            { session?.scopes?.includes("internal_organization_create") && <AddTeamModal refreshTeams={fetchTeams} />}
            <TeamList teams={teams} teamsLoading={loading} />
        </Container>
    );
};

export default Teams;
