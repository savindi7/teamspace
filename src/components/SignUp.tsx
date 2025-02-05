"use client";

import React, { useState, FormEvent } from "react";

const SignUp: React.FC = () => {
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [organization, setOrganization] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
    
        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, organization })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || "Signup failed.");
            }
    
            setMessage("User registered successfully!");
        } catch (error) {
            if (error instanceof Error) {
                setMessage(`Error: ${error.message}`);
                console.error("Signup Error:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-1">
            <h3 className="mb-1">Sign Up</h3>
            <form className="form" onSubmit={handleSignUp}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                />
                <button className="button" type="submit" disabled={loading}>
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default SignUp;
