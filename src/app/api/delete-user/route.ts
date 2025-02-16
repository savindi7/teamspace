import { Session } from "@auth/core/types";
import { auth } from "@/app/auth";

export async function DELETE(req: Request) {
  const session: Session | null = await auth();

  try {
    const { userId } = await req.json();
    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const deleteResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/Users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!deleteResponse.ok) {
      throw new Error(`HTTP error! Status: ${deleteResponse.status}`);
    }

    return Response.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
