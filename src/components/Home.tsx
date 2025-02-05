"use client";

import { useState } from "react";
import { handleSignIn, handleSignOut } from "../lib/serverActions";
import SignUp from "./SignUp";
import OrganizationSwitch from "./OrganizationSwitch";
import InviteUser from "./InviteUser";

export default function Home({ session }) {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="justify-items-center home">
      <h3>Asgardeo x Next.js B2B Sample App</h3>
      {!session ? (
        <div className="mt-3">
          <form action={handleSignIn}>
            <button className="button" type="submit">
              Sign in
            </button>
          </form>

          <form
            action={() => setShowSignUp(!showSignUp) }
          >
            <button className="button secondary">
              {showSignUp ? "Close Sign Up" : "Sign Up"}
            </button>
          </form>

          {showSignUp && <SignUp />}
        </div>
      ) : (
        <div className="mt-3">
          <p>Hello {session?.user?.email}</p>
          <p>You are now signed in to organization: {session?.orgName}</p>
          <OrganizationSwitch />
          <InviteUser />

          <form action={handleSignOut}>
            <button className="button" type="submit">
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
