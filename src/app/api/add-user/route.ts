export async function POST(req) {
    try {
      const { email, password, organization, selectedRoleId } = await req.json();
  
      if (!email || !password || !organization || !selectedRoleId) {
        return Response.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
  
      // Step 1: Get an access token
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
  
      // Step 2: Create user in the organization
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/Users`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emails: [{ primary: true, value: email }],
            name: { familyName: "LastName", givenName: "FirstName" },
            password: password,
            userName: `DEFAULT/${email}`,
          }),
        }
      );
  
      if (!userResponse.ok) {
        throw new Error("Failed to create user");
      }
  
      const userData = await userResponse.json();
      const userId = userData.id;
  
      // Step 3: Assign the selected role to the user
      const assignRoleResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/v2/Roles/${selectedRoleId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Operations: [
              {
                op: "add",
                path: "users",
                value: [{ value: userId }],
              },
            ],
          }),
        }
      );
  
      if (!assignRoleResponse.ok) {
        throw new Error("Failed to assign role to user");
      }
  
      return Response.json(
        { message: "User created and role assigned successfully!" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error in addUser route:", error);
      return Response.json({ error: "User creation failed" }, { status: 500 });
    }
  }
  