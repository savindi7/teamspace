export async function introspectToken(accessToken: string) {
  const clientId = process.env.NEXT_PUBLIC_AUTH_ASGARDEO_ID;
  const clientSecret = process.env.NEXT_PUBLIC_AUTH_ASGARDEO_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing required environment variables for introspection");
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/introspect`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
      body: new URLSearchParams({ token: accessToken }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to introspect token: ${response.statusText}`);
  }

  return await response.json();
}

export async function getCCGrantToken() {
  const tokenResponse = await fetch(
    `${process.env.NEXT_PUBLIC_AUTH_ASGARDEO_ISSUER}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.NEXT_PUBLIC_AUTH_ASGARDEO_ID!,
        client_secret: process.env.NEXT_PUBLIC_AUTH_ASGARDEO_SECRET!,
        scope: process.env.NEXT_PUBLIC_AUTH_SCOPE!,
      }).toString(),
    }
  );

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(
      errorData?.error || `HTTP error! status: ${tokenResponse?.status}`
    );
  }

  return await tokenResponse.json();
}

export function parseJwt(token: string) {
  const buffestString = Buffer.from(token.toString().split(".")[1], "base64");
  return JSON.parse(buffestString.toString());
}
