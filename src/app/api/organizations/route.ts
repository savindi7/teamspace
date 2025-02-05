import { auth } from "@/app/auth";
import { Session } from "@auth/core/types";

export async function GET() {
    const session: Session  = await auth();

  if (!session || !session?.user || !session?.user?.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_ASGARDEO_BASE_ORGANIZATION_URL}/o/api/users/v1/me/organizations`;

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${session?.user?.accessToken}`,
    },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch organizations" }), { status: response.status });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
