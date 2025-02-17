export function getRootOrgName() {
  const baseUrl = process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL;
  if (!baseUrl) {
    throw new Error("Base URL is not defined");
  }
  const parts = baseUrl.split("/");
  return parts[parts.length - 1];
}

export function isSubOrg(orgName: string) {
  const currentOrgName = orgName;
  const rootOrgName = getRootOrgName();
  return !(currentOrgName === rootOrgName);
}
