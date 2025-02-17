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

    // Check if user exists
    const checkUserResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/scim2/Users?filter=emails eq "${email}"`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.rootOrgToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!checkUserResponse.ok) {
      throw new Error("Failed to check if user exists");
    }

    const checkUserData = await checkUserResponse.json();
    const userExists = checkUserData?.totalResults > 0;

    if (!userExists) {
      // User does not exist, invite using Ask Password flow
      const inviteUserResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/scim2/Users`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.rootOrgToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emails: [{ primary: true, value: email }],
            "urn:scim:wso2:schema": { askPassword: "true" },
            userName: `DEFAULT/${email}`,
          }),
        }
      );

      if (!inviteUserResponse.ok) {
        throw new Error("Failed to invite user using ask-password flow");
      }

      const inviteUserData = await inviteUserResponse.json();

      return Response.json(
        { message: "User invited successfully!", data: inviteUserData },
        { status: 200 }
      );
    } else {
      // User already exists, proceed with normal invitation
       const inviteUserResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/api/server/v1/guests/invite`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
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
        throw new Error("Failed to invite existing user");
      }

      const inviteUserData = await inviteUserResponse.json();

      return Response.json(
        { message: "Existing user invited successfully!", data: inviteUserData },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in user invitation:", error);
    return Response.json({ error: "User invite failed" }, { status: 500 });
  }
}
