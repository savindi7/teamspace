export async function checkOrganizationExists(accessToken: string, teamName: string) {
    const response = await fetch(
      `${process.env.ASGARDEO_BASE_URL}/api/server/v1/organizations/check-name`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: teamName }),
      }
    );
  
    if (!response.ok) {
      throw new Error(`Error checking organization: ${response.statusText}`);
    }
  
    return response.json();
  }
  
  export async function createOrganization(accessToken: string, teamName: string, teamDescription: string, userId: string, userEmail: string) {
    const response = await fetch(
      `${process.env.ASGARDEO_BASE_URL}/api/server/v1/organizations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription,
          attributes: [
            { key: "creator.id", value: userId },
            { key: "creator.username", value: userEmail },
          ],
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to create organization");
    }
  
    return response.json();
  }
  