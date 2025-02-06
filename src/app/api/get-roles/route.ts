import { Session } from "@auth/core/types";
import { auth } from "@/app/auth";

export async function GET() {
    const session: Session  = await auth();

    try {
  
      // Fetch roles
      const getRolesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/v2/Roles`,
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
  