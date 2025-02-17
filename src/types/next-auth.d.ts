import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null
      access_token?: string
      name?: string | null
      image?: string | null
    }
    scopes?: string[] | null
    id_token?: string | null
    orgName?: string | null
    rootOrgName?: string
    rootOrgToken?: string
    isSubOrg?: boolean
    rootOrgId?: string
  }

  interface JWT {
    access_token?: string
    id_token?: string
    email?: string
    scopes?: string[]
  }
}

interface TokenPayload {
  scope: string
  org_name?: string
  [key: string]: unknown
}