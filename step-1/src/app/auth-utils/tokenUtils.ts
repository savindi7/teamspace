export async function getCCGrantToken() {
  const tokenResponse = await fetch(
    `${process.env.AUTH_ASGARDEO_ISSUER}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AUTH_ASGARDEO_ID!,
        client_secret: process.env.AUTH_ASGARDEO_SECRET!,
        scope: process.env.AUTH_SCOPE!,
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

