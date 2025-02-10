import { Session } from "@auth/core/types";
import { auth } from "@/app/auth";

export async function GET() {
  const session: Session = await auth();

  try {
    // Get Application ID
    const getAppResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/api/server/v1/applications?filter=name%20eq%20${process.env.NEXT_PUBLIC_APP_NAME}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      }
    );

    if (!getAppResponse.ok) {
      throw new Error(`HTTP error! Status: ${getAppResponse.status}`);
    }

    const data = await getAppResponse.json();
    const appId = data?.applications[0]?.id;

    // Fetch roles
    const getRolesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/v2/Roles?filter=audience.value%20eq%20${appId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
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
