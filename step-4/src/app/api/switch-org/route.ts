import { NextResponse } from "next/server";
import { Session } from "@auth/core/types";
import { auth } from "@/app/auth";
import { switchOrganizationToken } from "@/app/api/services/authService";

export async function POST(req: Request) {
  const session: Session | null = await auth();

  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const accessToken = session?.user?.access_token as string;

    const orgAccessTokenData = await switchOrganizationToken(accessToken, orgId);

    if (orgAccessTokenData.access_token && orgAccessTokenData.id_token) {

      return NextResponse.json({ accessToken: orgAccessTokenData.access_token, id_token: orgAccessTokenData.id_token });
    }

    return NextResponse.json({ error: "Invalid response from server" }, { status: 500 });
  } catch (error) {
    console.error("Error switching organization:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
