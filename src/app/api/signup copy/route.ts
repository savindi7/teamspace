export async function POST(req) {
  try {
    const { email, password, organization } = await req.json();

    if (!email || !password || !organization) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    //Get an access token from root org.
    const tokenResponse = await fetch(
      process.env.NEXT_PUBLIC_ASGARDEO_TOKEN_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_SECRET,
          scope: process.env.NEXT_PUBLIC_AUTH_SCOPE,
        }).toString(),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(
        errorData?.error || `HTTP error! status: ${tokenResponse?.status}`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData?.access_token;

    //Check if Organization exists
    const checkOrgResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/api/server/v1/organizations/check-name`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: organization }),
      }
    );

    if (!checkOrgResponse.ok) {
      throw new Error(
        `Error checking organization: ${checkOrgResponse.statusText}`
      );
    }

    const checkOrgData = await checkOrgResponse.json();

    let orgId;

    if (!checkOrgData?.data?.exists) {
      // Create Organization if it doesn't exist
      const createOrgResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/api/server/v1/organizations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: organization }),
        }
      );

      if (!createOrgResponse.ok) {
        throw new Error("Failed to create organization");
      }

      const responseData = await createOrgResponse.json();
      orgId = responseData.id;
    } else {
      orgId = checkOrgData?.data?.id;
    }

    //Get Access Token for the organization
    const orgTokenResponse = await fetch(
      process.env.NEXT_PUBLIC_ASGARDEO_TOKEN_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "organization_switch",
          client_id: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_SECRET,
          token: accessToken,
          switching_organization: orgId,
          scope: process.env.NEXT_PUBLIC_AUTH_SCOPE,
        }).toString(),
      }
    );

    if (!orgTokenResponse.ok) {
      throw new Error(
        `Error fetching organization access token: ${orgTokenResponse.statusText}`
      );
    }

    const orgTokenData = await orgTokenResponse.json();
    const orgAccessToken = orgTokenData?.access_token;

    // Create user in organization
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/Users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${orgAccessToken}`,
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

    console.log("User Creation Response:", userResponse);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`User creation failed: ${errorText}`);
    }

    const userData = await userResponse.json();

    console.log("User Creation Response data:", userData);

    const userId = userData?.id;

    // Get Application ID
    const getAppResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/api/server/v1/applications?filter=name%20eq%20${
        process.env.NEXT_PUBLIC_APP_NAME}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${orgAccessToken}`,
        },
      }
    );

    if (!getAppResponse.ok) {
      throw new Error(`HTTP error! Status: ${getAppResponse.status}`);
    }

    const data = await getAppResponse.json();
    const appId = data?.applications[0]?.id;

    console.log("appId", appId);

    // Get Role ID
    const getRolesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/v2/Roles?filter=displayName%20eq%20${
        process.env.NEXT_PUBLIC_B2B_ADMIN_ROLE_NAME_ENCODED}%20and%20audience.value%20eq%20${appId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${orgAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!getRolesResponse.ok) {
      throw new Error(`HTTP error! Status: ${getRolesResponse.status}`);
    }

    const rolesData = await getRolesResponse.json();

    console.log("rolesData", rolesData);

    if (!rolesData?.Resources || rolesData.Resources.length === 0) {
      throw new Error("Role not found");
    }

    const roleId = rolesData?.Resources[0]?.id;

    console.log("roleId", roleId);

    // Assign Role to User
    const assignRoleResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/v2/Roles/${roleId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${orgAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Operations: [
            {
              op: "add",
              path: "users",
              value: [
                {
                  value: userId,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!assignRoleResponse.ok) {
      throw new Error(`HTTP error! Status: ${assignRoleResponse.status}`);
    }

    const assignRoleData = await assignRoleResponse.json();

    return Response.json(
      { message: "User registered successfully!", data: assignRoleData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup Error:", error?.response?.data || error.message);
    return Response.json(
      { error: error.response?.data?.error || "Signup failed" },
      { status: error.response?.status || 500 }
    );
  }
}
