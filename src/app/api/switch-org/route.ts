import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orgId, accessToken } = await req.json();

    if (!orgId || !accessToken) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const authHeader = Buffer.from(
      `${process.env.NEXT_PUBLIC_AUTH_ASGARDEO_ID}:${process.env.NEXT_PUBLIC_AUTH_ASGARDEO_SECRET}`
    ).toString("base64");

    const params = new URLSearchParams();
    params.append("grant_type", "organization_switch");
    params.append("switching_organization", orgId);
    params.append("token", accessToken);
    params.append("scope", process.env.NEXT_PUBLIC_AUTH_SCOPE || "");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to switch organization" }, { status: 500 });
    }

    const data = await response.json();

    if (data.access_token) {
      return NextResponse.json({ accessToken: data.access_token });
    }

    return NextResponse.json({ error: "Invalid response from server" }, { status: 500 });
  } catch (error) {
    console.error("Error switching organization:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
