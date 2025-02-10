import { auth } from "@/app/auth";

export async function POST(req: Request): Promise<Response> {
  const session = await auth();

  try {
    const { email, selectedRoleId } = await req.json();

    if (!email || !selectedRoleId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Invite User
    const inviteUserResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/api/server/v1/guests/invite`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            usernames: [email],
            roles: [selectedRoleId],
            properties: [
              {
                key: "manageNotificationsInternally",
                value: "true",
              },
            ],
          }),
      }
    );

    if (!inviteUserResponse.ok) {
      throw new Error("Failed to invite user");
    }

    const inviteUserData = await inviteUserResponse.json();

    return Response.json(
        { message: "User invited successfully!", data: inviteUserData },
        { status: 200 }
      );
  } catch (error) {
    console.error("Error in inviting user:", error);
    return Response.json({ error: "User invite failed" }, { status: 500 });
  }
}
