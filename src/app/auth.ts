import NextAuth from "next-auth";
import Asgardeo from "next-auth/providers/asgardeo";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Asgardeo({
      clientId: process.env.AUTH_ASGARDEO_ID,
      clientSecret: process.env.AUTH_ASGARDEO_SECRET,
      issuer: `https://api.asgardeo.io/t/savindi/oauth2/token`,
      authorization: {
        params: {
          scope: process.env.AUTH_SCOPE,
        },
        },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, account }) {

        if (profile) {
            // token.idToken = account?.id_token || ""; // Ensure idToken is stored
            token.email = profile?.username
            // token.username = profile?.username || profile?.email || ""; // Assign a username safely
          }
          if (account) {
            console.log("account", account)
            token.accessToken = account?.access_token;
            token.id_token = account?.id_token;        
          }

          return token;
    },
    async session({ session, token }) {

        if (token?.accessToken) {
          session.user = session.user || {};
          session.user.accessToken = token.accessToken;
        //   session.user.username = token.username || "Unknown User";
          session.id_token = token.id_token || null;
          session.orgName = session.id_token ? getOrgName(session.id_token) : null;
        }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
});

export function parseJwt(token) {

    const buffestString = Buffer.from(token.toString().split(".")[1], "base64");

    return JSON.parse(buffestString.toString());
}

export function getOrgName(token) {

    if (parseJwt(token)["org_name"]) {
        console.log(parseJwt(token)["org_name"]);

        return parseJwt(token)["org_name"];
    }

    return process.env.SUB_ORGANIZATION_NAME;
}
