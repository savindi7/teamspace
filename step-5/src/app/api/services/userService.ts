export async function getUserId(accessToken: string): Promise<string> {
  const response = await fetch(`${process.env.ASGARDEO_BASE_URL}/scim2/Me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/scim+json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching user info: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

export async function getShadowAccountId(
  accessToken: string,
  email: string
): Promise<string> {
  const response = await fetch(
    `${
      process.env.ASGARDEO_BASE_URL
    }/o/scim2/Users?filter=userName%20eq%20${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.Resources[0]?.id;
}

export async function getUser(
  accessToken: string,
  email: string
): Promise<any | null> {
  const response = await fetch(
    `${process.env.ASGARDEO_BASE_URL}/scim2/Users?filter=emails eq "${email}"`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data?.totalResults > 0 ? data?.Resources[0] : null;
}

export async function createUser(
  accessToken: string,
  email: string,
  firstName: string,
  lastName: string,
  password: string
): Promise<string | null> {
  const response = await fetch(`${process.env.ASGARDEO_BASE_URL}/scim2/Users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      emails: [{ primary: true, value: email }],
      name: { familyName: lastName, givenName: firstName },
      password: password,
      userName: `DEFAULT/${email}`,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data?.id || null;
}
