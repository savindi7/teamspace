export async function GET() {
    try {
      // Get an access token
      const tokenResponse = await fetch(process.env.NEXT_PUBLIC_ASGARDEO_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_SECRET,
          scope: process.env.NEXT_PUBLIC_AUTH_SCOPE,
        }).toString(),
      });
  
      if (!tokenResponse.ok) {
        throw new Error("Failed to get access token");
      }
  
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
  
      // Fetch roles
      const getRolesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/v2/Roles`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!getRolesResponse.ok) {
        throw new Error(`HTTP error! Status: ${getRolesResponse.status}`);
      }
  
      const rolesData = await getRolesResponse.json();
      return Response.json({ roles: rolesData.Resources || [] }, { status: 200 });
    } catch (error) {
      console.error("Error fetching roles:", error);
      return Response.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
  }
  