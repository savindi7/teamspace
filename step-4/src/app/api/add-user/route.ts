import { auth } from "@/app/auth";

export async function POST(req: Request): Promise<Response> {
  const session = await auth();

  try {
    const { email, password, selectedRoleId } = await req.json();

    if (!email || !password || !selectedRoleId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create user in the organization
    const userResponse = await fetch(
      `${process.env.ASGARDEO_BASE_URL}/o/scim2/Users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
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
    const userId = userData?.id;

    // Assign the selected role to the user
    const assignRoleResponse = await fetch(
      `${process.env.ASGARDEO_BASE_URL}/o/scim2/v2/Roles/${selectedRoleId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
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
