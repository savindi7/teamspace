import { FormEvent, useEffect, useState } from "react";

const InviteUser = () => {
    const [email, setEmail] = useState("");
    const [organization, setOrganization] = useState("");
    const [role, setRole] = useState("");
    const [roles, setRoles] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch("/api/get-roles");
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Failed to fetch roles.");
                
                setRoles(data.roles || []);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
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
                body: JSON.stringify({ email, organization, role })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Invite failed.");

            setMessage("User invited successfully!");
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
        <form className="form" onSubmit={handleInvite}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="User Email"
                required
            />
            <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Organization"
                required
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="">Select Role</option>
                {roles.map((r) => (
                    <option key={r} value={r}>
                        {r}
                    </option>
                ))}
            </select>
            <button className="button secondary" type="submit" disabled={loading}>
                {loading ? "Inviting..." : "Invite User"}
            </button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default InviteUser;
