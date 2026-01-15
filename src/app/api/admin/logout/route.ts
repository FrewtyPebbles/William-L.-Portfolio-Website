import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  (await cookies()).delete("admin_auth")
  
  return NextResponse.redirect(new URL("/admin/login", request.url), {
    status: 303,
  });
}
