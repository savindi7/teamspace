export type Name = {
    givenName: string,
    familyName: string
}

export interface User {
    id: string | undefined,
    name: Name,
    emails: string[] | undefined,
    userName: string | undefined,
    accessToken?: string | undefined,
    [key: string]: unknown
}