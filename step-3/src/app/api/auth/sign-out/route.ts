import { auth } from "@/app/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();

    if (session) {
      const logoutUrl = `${process.env.NEXT_PUBLIC_ASGARDEO_LOGOUT_URL}?id_token_hint=${
        session.id_token}&post_logout_redirect_uri=${process.env.NEXT_PUBLIC_HOSTED_URL}`;

      return NextResponse.json({ logoutUrl });
    } else {
      return new NextResponse("No active session found", { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Error logging out", { status: 500 });
  }
}
