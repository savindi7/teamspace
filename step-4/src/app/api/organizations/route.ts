import { auth } from "@/app/auth";
import { Session } from "@auth/core/types";

export async function GET() {
    const session: Session | null  = await auth();

  if (!session || !session?.user || !session?.user?.access_token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const apiUrl = `${process.env.ASGARDEO_BASE_URL}/o/api/users/v1/me/organizations`;

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${session?.user?.access_token}`,
    },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch organizations" }), { status: response.status });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
