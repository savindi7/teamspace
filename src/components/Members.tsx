import React from "react";
import { Container, Typography } from "@mui/material";
import AddMemberModal from "@/components/AddMemberModal";
import MemberList from "@/components/MemberList";
import { useSession } from "next-auth/react";

const Members: React.FC = () => {
  const { data: session } = useSession();
  return (
    <Container>
      <Typography variant="h4" margin={3} gutterBottom>
        Team Members
      </Typography>
     { (session && session?.scopes?.includes("internal_org_user_mgt_create")) &&
      <AddMemberModal />}
      <MemberList />
    </Container>
  );
};

export default Members;
