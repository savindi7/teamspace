"use server";

import { signIn, signOut } from "@/app/auth";

export async function handleSignIn() {
  await signIn("asgardeo");
}

export async function handleSignOut() {
  await signOut();
}
