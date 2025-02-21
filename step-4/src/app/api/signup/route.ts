import { auth } from "@/app/auth";
import { Session } from "@auth/core/types";

export async function POST(req: Request) {
  const session: Session | null  = await auth();

  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const accessToken = session?.rootOrgToken;

    // Create user in root organization
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/scim2/Users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: [{ primary: true, value: email }],
          name: { familyName: lastName, givenName: firstName },
          password: password,
          userName: `DEFAULT/${email}`,
        }),
      }
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`User creation failed: ${errorText}`);
    }

    const userData = await userResponse.json();
    const userId = userData?.id;

    // Get Application ID
    const getAppResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/api/server/v1/applications?filter=name%20eq%20${process.env.NEXT_PUBLIC_APP_NAME}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
      `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/scim2/v2/Roles?filter=displayName%20eq%20${encodeURIComponent(process.env.NEXT_PUBLIC_B2B_ADMIN_ROLE_NAME!)}%20and%20audience.value%20eq%20${appId}`,
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

    if (!rolesData?.Resources || rolesData.Resources.length === 0) {
      throw new Error("Role not found");
    }

    const roleId = rolesData?.Resources[0]?.id;

    // Assign Role to User
    const assignRoleResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/scim2/v2/Roles/${roleId}`,
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
  } catch (error: unknown) {
    let errorMessage = "Signup failed";

    if (error instanceof Error) {
      const match = error.message.match(/\{.*\}/);
      if (match) {
        try {
          const errorJson = JSON.parse(match[0]) as { detail?: string };
          errorMessage = errorJson.detail || errorMessage;
        } catch (parseError: unknown) {
          console.error(
            "Error parsing error message:",
            parseError instanceof Error
              ? parseError.message
              : "Unknown parse error"
          );
        }
      }
    }

    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
