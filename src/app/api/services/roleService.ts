export async function getAppId(accessToken: string): Promise<string> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/api/server/v1/applications?filter=name%20eq%20${process.env.NEXT_PUBLIC_APP_NAME}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  
    const data = await response.json();
    return data.applications[0]?.id;
  }
  
  export async function getRoleId(accessToken: string, appId: string): Promise<string> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/v2/Roles?filter=displayName%20eq%20${process.env.NEXT_PUBLIC_B2B_ADMIN_ROLE_NAME_ENCODED}%20and%20audience.value%20eq%20${appId}`,
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
  
  export async function assignRole(accessToken: string, roleId: string, userId: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ASGARDEO_ORG_URL}/o/scim2/v2/Roles/${roleId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Operations: [{ op: "add", path: "users", value: [{ value: userId }] }],
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  
    return response.json();
  }
  