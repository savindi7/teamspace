import { Session } from "@auth/core/types";
import { auth } from "@/app/auth";

export async function GET() {
    const session: Session | null  = await auth();

    try {
      const getUsersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/o/scim2/Users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!getUsersResponse.ok) {
        throw new Error(`HTTP error! Status: ${getUsersResponse.status}`);
      }
  
      const userData = await getUsersResponse.json();
      return Response.json({ users: userData.Resources || [] }, { status: 200 });
    } catch (error) {
      console.error("Error fetching users:", error);
      return Response.json({ error: "Failed to fetch users" }, { status: 500 });
    }
  }
