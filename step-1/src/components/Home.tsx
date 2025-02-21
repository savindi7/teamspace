"use client";

import type React from "react";
import SignUp from "./SignUp";
import { Container, Box } from "@mui/material";
import Navbar from "./Navbar";

export default function Home() {
  return (
    <Container className="home">
      <Navbar />
      <Box textAlign="center" mt={2}>
        <SignUp />
      </Box>
    </Container>
  );
}
