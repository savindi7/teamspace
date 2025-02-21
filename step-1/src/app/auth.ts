import NextAuth from "next-auth";
import Asgardeo from "next-auth/providers/asgardeo";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Asgardeo({
      clientId: process.env.NEXT_PUBLIC_AUTH_ASGARDEO_ID,
      clientSecret: process.env.NEXT_PUBLIC_AUTH_ASGARDEO_SECRET,
      issuer: process.env.NEXT_PUBLIC_AUTH_ASGARDEO_ISSUER,
      authorization: {
        params: {
          scope: process.env.NEXT_PUBLIC_AUTH_SCOPE,
        },
      },
    }),
  ],
  debug: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
});
