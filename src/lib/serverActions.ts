"use server";

import { signIn, signOut } from "../app/auth"; // Adjust the path if needed

export async function handleSignIn() {
    console.log("hitt")
  await signIn("asgardeo");
}

export async function handleSignOut() {
  await signOut();
}
