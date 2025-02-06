import { FormEvent, useEffect, useState } from "react";
import TeamMembers from "./TeamMembers";

interface User {
  id: string;
  name: { givenName: string };
  emails: string[];
}

const InviteUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState<{ id: string; displayName: string }[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/get-users");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch users.");

        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load team members.");
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/get-roles");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch roles.");

        setRoles(data.roles || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchUsers();
    fetchRoles();
  }, []);

  const handleInvite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, selectedRoleId: role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invite failed.");

      setMessage("User invited successfully!");

      // Update users list with the new user
      setUsers((prevUsers) => [
        ...prevUsers,
        { id: data.id, name: { givenName: email }, emails: [email] },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
        console.error("Invite Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="form" onSubmit={handleInvite}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="User Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.displayName}
            </option>
          ))}
        </select>
        <button className="button secondary" type="submit" disabled={loading}>
          {loading ? "Inviting..." : "Invite User"}
        </button>
        {message && <p>{message}</p>}
      </form>
      <TeamMembers users={users} />
    </>
  );
};

export default InviteUser;
