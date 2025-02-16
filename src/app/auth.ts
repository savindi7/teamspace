import NextAuth from "next-auth";
import Asgardeo from "next-auth/providers/asgardeo";
import { Session } from "@auth/core/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Asgardeo({
      clientId: process.env.AUTH_ASGARDEO_ID,
      clientSecret: process.env.AUTH_ASGARDEO_SECRET,
      issuer: process.env.AUTH_ASGARDEO_ISSUER,
      authorization: {
        params: {
          scope: process.env.AUTH_SCOPE,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, account, trigger, session }) {
      if (profile) {
        token.email = profile?.username as string;
      }

      if (account) {
        token.access_token = account?.access_token;
        token.id_token = account?.id_token;
      }

      if (trigger === "update") {
        if (session?.user?.access_token) {
          token.access_token = session.user.access_token;
        }

        if (session?.id_token) {
          token.id_token = session.id_token;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.access_token) {
        session.scopes = parseJwt(token.access_token as string).scope || null;
        session.rootOrgId =
          parseJwt(token.access_token as string).user_org || null;
        session.user = session.user || {};
        session.user.access_token = token.access_token as string;
        session.id_token = token.id_token as string;
        session.orgName = session.id_token
          ? getOrgName(session.id_token)
          : null;
        session.rootOrgName = getRootOrgName();
        session.isSubOrg = isSubOrg(session);
      }

      return session;
    },
  },
  debug: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
});

export function parseJwt(token: string) {
  const buffestString = Buffer.from(token.toString().split(".")[1], "base64");
  return JSON.parse(buffestString.toString());
}

export function getOrgName(token: string) {
  if (parseJwt(token)["org_name"]) {
    return parseJwt(token)["org_name"];
  }
  return process.env.SUB_ORGANIZATION_NAME;
}

export function getRootOrgName() {
  const baseUrl = process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL;
  if (!baseUrl) {
    throw new Error("Base URL is not defined");
  }
  const parts = baseUrl.split("/");
  return parts[parts.length - 1];
}

export function isSubOrg(session: Session) {
  const currentOrgName = getOrgName(session?.id_token as string);
  const rootOrgName = getRootOrgName();
  return !(currentOrgName === rootOrgName);
}
