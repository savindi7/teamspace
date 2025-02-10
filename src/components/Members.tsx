import React from "react";
import { Container, Typography } from "@mui/material";
import AddMemberModal from "@/components/AddMemberModal";
import MemberList from "@/components/MemberList";

const Members: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Members
      </Typography>
      <AddMemberModal />
      <MemberList />
    </Container>
  );
};

export default Members;
