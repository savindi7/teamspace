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
  
  export async function getShadowAccountId(accessToken: string, email: string): Promise<string> {
    const response = await fetch(
      `${process.env.ASGARDEO_BASE_URL}/o/scim2/Users?filter=userName%20eq%20${encodeURIComponent(email)}`,
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
  