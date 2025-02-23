export async function switchOrganizationToken(
  accessToken: string,
  orgId: string
): Promise<{ access_token: string; id_token: string }> {
  const authHeader = Buffer.from(
    `${process.env.AUTH_ASGARDEO_ID}:${process.env.AUTH_ASGARDEO_SECRET}`
  ).toString("base64");

  const params = new URLSearchParams();
  params.append("grant_type", "organization_switch");
  params.append("switching_organization", orgId);
  params.append("token", accessToken);
  params.append("scope", process.env.AUTH_SCOPE!);

  const response = await fetch(
    `${process.env.AUTH_ASGARDEO_ISSUER}`,
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
    throw new Error(
      `Error fetching organization access token: ${response.statusText}`
    );
  }

  const data = await response.json();
  return { access_token: data.access_token, id_token: data.id_token };
}
