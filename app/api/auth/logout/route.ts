// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
}
