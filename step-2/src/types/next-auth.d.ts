import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null
      access_token?: string
      name?: string | null
      image?: string | null
      firstName?: string
      lastName?: string
    }
    scopes?: string[] | null
    id_token?: string | null
    orgName?: string | null
    rootOrgToken?: string
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