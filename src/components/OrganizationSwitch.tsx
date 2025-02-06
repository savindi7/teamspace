"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Session from "@/models/session";

export default function OrganizationSwitch() {
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.accessToken) {
      fetch("/api/organizations")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          console.log("Organizations API Response:", data);
          setOrganizations(data.organizations || []);
        })
        .catch((err) => {
          console.error("Error fetching organizations:", err);
          setError("Failed to load organizations");
        });
    }
  }, [status, session]);

  const handleOrgSwitch = async (orgId: string, session: Session) => {
    if (!orgId || !session?.user?.accessToken) return;

    try {
      const response = await fetch("/api/switch-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, accessToken: session.user.accessToken }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        window.location.reload();
      } else {
        console.error("Error switching organization:", data.error);
      }
    } catch (error) {
      console.error("Error switching organization:", error);
    }
  };

  return (
    <div className="organization-switch-container">
      {organizations.length > 0 && (
        <>
          <h3>Switch Team</h3>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="organization-grid">
            {organizations.map((org) => (
              <button
                key={org.id}
                className={`org-box ${
                  selectedOrg === org.id ? "selected" : ""
                }`}
                onClick={() => handleOrgSwitch(org.id, session)}
                disabled={loading}
              >
                {org.name}
              </button>
            ))}
          </div>
        </>
      )}

      {loading && <p>Switching organization...</p>}
    </div>
  );
}
