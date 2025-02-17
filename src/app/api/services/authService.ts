export async function switchOrganizationToken(accessToken: string, orgId: string): Promise<string> {
    const authHeader = Buffer.from(
      `${process.env.NEXT_PUBLIC_AUTH_ASGARDEO_ID}:${process.env.NEXT_PUBLIC_AUTH_ASGARDEO_SECRET}`
    ).toString("base64");
  
    const params = new URLSearchParams();
    params.append("grant_type", "organization_switch");
    params.append("switching_organization", orgId);
    params.append("token", accessToken);
    params.append("scope", process.env.NEXT_PUBLIC_AUTH_SCOPE!);
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
  
    if (!response.ok) {
      throw new Error(`Error fetching organization access token: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.access_token;
  }