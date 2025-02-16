import { Session } from "@auth/core/types";
import { auth } from "@/app/auth";

export async function POST(req: Request) {
  const session: Session | null = await auth();

  if (!session) {
    throw new Error("Authentication failed");
  }

  try {
    const { teamName, teamDescription } = await req.json();

    if (!teamName) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    //Get an access token with cc grant type from root org.
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_TOKEN_URL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID!,
          client_secret: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_SECRET!,
          scope: process.env.NEXT_PUBLIC_CREATE_ADMIN_SCOPE!,
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

    // Check if Organization exists.
    const checkOrgResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/api/server/v1/organizations/check-name`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: teamName }),
      }
    );

    if (!checkOrgResponse.ok) {
      throw new Error(
        `Error checking organization: ${checkOrgResponse.statusText}`
      );
    }

    const checkOrgData = await checkOrgResponse.json();

    // Get user ID from Asgardeo 'me' endpoint
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/scim2/Me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
          accept: "application/scim+json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error(`Error fetching user info: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    const userId = userData?.id;

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
          body: JSON.stringify({
            name: teamName,
            description: teamDescription,
            attributes: [
              {
                key: "creator.id",
                value: userId,
              },
              {
                key: "creator.username",
                value: session?.user?.email,
              },
            ],
          }),
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

    // switch token
    const authHeader = Buffer.from(
      `${process.env.NEXT_PUBLIC_AUTH_ASGARDEO_ID}:${process.env.NEXT_PUBLIC_AUTH_ASGARDEO_SECRET}`
    ).toString("base64");

    const params = new URLSearchParams();
    params.append("grant_type", "organization_switch");
    params.append("switching_organization", orgId);
    params.append("token", accessToken);
    params.append("scope", `${process.env.NEXT_PUBLIC_CREATE_ADMIN_SCOPE}`);

    const orgTokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!orgTokenResponse.ok) {
      throw new Error(
        `Error fetching organization access token: ${orgTokenResponse.statusText}`
      );
    }

    const orgTokenData = await orgTokenResponse.json();
    const orgAccessToken = orgTokenData?.access_token;

    //Get the shadow account's user id
    const getShadowAccountResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL
      }/o/scim2/Users?filter=userName%20eq%20${encodeURIComponent(
        session?.user?.email ?? ""
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${orgAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!getShadowAccountResponse.ok) {
      throw new Error(`HTTP error! Status: ${getShadowAccountResponse.status}`);
    }

    const shadowAccountData = await getShadowAccountResponse.json();
    const shadowAccountId = shadowAccountData?.Resources[0]?.id;

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

    if (!rolesData?.Resources || rolesData.Resources.length === 0) {
      throw new Error("Role not found");
    }

    const roleId = rolesData?.Resources[0]?.id;

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
                  value: shadowAccountId,
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
      { message: "Team created successfully!", data: assignRoleData },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json(
        { error: error.message || "Adding Team failed" },
        { status: 500 }
      );
    }
  
    return Response.json(
      { error: "Adding Team failed" },
      { status: 500 }
    );
  }
}
