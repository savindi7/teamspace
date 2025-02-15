import NextAuth from "next-auth";
import Asgardeo from "next-auth/providers/asgardeo";

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
        token.email = profile?.username;
      }

      if (account) {
        token.accessToken = account?.access_token;
        token.id_token = account?.id_token;
      }

      if (trigger === "update") {
        console.log("Updating JWT with new session data");

        if (session?.user?.accessToken) {
          token.accessToken = session.user.accessToken;
        }

        if (session?.id_token) {
          token.id_token = session.id_token;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.scopes = parseJwt(token.accessToken).scope || null;
        session.user = session.user || {};
        session.user.accessToken = token.accessToken;
        session.id_token = token.id_token || null;
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

export function parseJwt(token) {
  const buffestString = Buffer.from(token.toString().split(".")[1], "base64");
  return JSON.parse(buffestString.toString());
}

export function getOrgName(token) {
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

export function isSubOrg(session) {
  const currentOrgName = getOrgName(session.id_token);
  const rootOrgName = getRootOrgName();
  return !(currentOrgName === rootOrgName);
}
