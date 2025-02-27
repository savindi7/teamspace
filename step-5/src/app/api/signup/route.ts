import { getCCGrantToken } from "@/app/auth-utils/tokenUtils";
import { assignRole, getAppId, getRoleId } from "../services/roleService";
import { createUser, getUser } from "../services/userService";

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ccGrantToken = await getCCGrantToken();
    const accessToken = ccGrantToken?.access_token;
    if (!accessToken) {
      return Response.json({ error: "Failed to obtain access token" }, { status: 500 });
    }

    // Get App ID
    const appId = await getAppId(accessToken);
    if (!appId) {
      return Response.json({ error: "Failed to fetch application details" }, { status: 500 });
    }

    //Get Role ID
    const roleId = await getRoleId(accessToken, appId);
    if (!roleId) {
      return Response.json({ error: "Failed to fetch role details" }, { status: 500 });
    }

    // Check if the user already exists
    const existingUser = await getUser(accessToken, email);
    if (existingUser) {

      const isAdmin = existingUser?.roles?.some(
        (role: { display: string }) => role.display === process.env.ADMIN_ROLE_NAME
      );

      if (isAdmin) {
        return Response.json({ error: "User already exists." }, { status: 400 });
      }

      // Assign the role if the user exists
      if (await assignRole(accessToken, roleId, existingUser.id)) {
        return Response.json({ message: "User role assigned successfully!" }, { status: 200 });
      } else {
        return Response.json({ error: "Failed to assign role to existing user" }, { status: 500 });
      }
    }

    // Create a new user
    const userId = await createUser(accessToken, email, firstName, lastName, password);
    if (!userId) {
      return Response.json({ error: "User creation failed" }, { status: 500 });
    }

    // Assign role to new user
    if (await assignRole(accessToken, roleId, userId)) {
      return Response.json({ message: "User registered successfully!" }, { status: 200 });
    } else {
      return Response.json({ error: "Failed to assign role to new user" }, { status: 500 });
    }
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ error: "Signup failed" }, { status: 500 });
  }
}
