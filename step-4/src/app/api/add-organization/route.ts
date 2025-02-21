import { auth } from "@/app/auth";
import { switchOrganizationToken } from "@/app/api/services/authService";
import { checkOrganizationExists, createOrganization } from "@/app/api/services/orgService";
import { getUserId, getShadowAccountId } from "@/app/api/services/userService";
import { getAppId, getRoleId, assignRole } from "@/app/api/services/roleService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) throw new Error("Authentication failed");

  const { teamName, teamDescription } = await req.json();
  if (!teamName) return Response.json({ error: "Missing required fields" }, { status: 400 });

  const accessToken = session?.rootOrgToken as string;
  const orgExists = await checkOrganizationExists(accessToken, teamName);
  const userId = await getUserId(session?.user?.access_token as string);

  const orgId = orgExists?.data?.exists ? orgExists?.data?.id : (await createOrganization(accessToken, teamName, teamDescription, userId, session.user.email!)).id;
  const orgAccessToken = await switchOrganizationToken(accessToken, orgId);

  const shadowAccountId = await getShadowAccountId(orgAccessToken, session?.user?.email as string);
  const appId = await getAppId(orgAccessToken);
  const roleId = await getRoleId(orgAccessToken, appId);

  const roleAssignment = await assignRole(orgAccessToken, roleId, shadowAccountId);
  return Response.json({ message: "Team created successfully!", data: roleAssignment }, { status: 200 });
}
