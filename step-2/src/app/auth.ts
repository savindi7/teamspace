import NextAuth from "next-auth";
import Asgardeo from "next-auth/providers/asgardeo";
import {
  introspectToken,
  getCCGrantToken,
  parseJwt,
} from "@/app/auth-utils/tokenUtils";

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
        session.user = session.user || {};
        session.user.access_token = token.access_token as string;
        session.id_token = token.id_token as string;
        session.user.firstName = parseJwt(session.id_token)["given_name"];
        session.user.lastName = parseJwt(session.id_token)["family_name"];

        // Call OAuth2 introspection to get scopes
        try {
          const introspectionResponse = await introspectToken(
            token?.access_token as string
          );
          session.scopes = introspectionResponse.scope || null;
        } catch (error) {
          console.error("Error in token introspection:", error);
        }

        // Get token from root org with client credentials grant type
        try {
          const ccGrantToken = await getCCGrantToken();
          session.rootOrgToken = ccGrantToken?.access_token;
        } catch (error) {
          console.error(
            "Error in getting token with client credentials grant type:",
            error
          );
        }
      }

      return session;
    },
  },
  debug: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
});
