import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  return NextResponse.json(
    {
      status: 200,
      message: "Logged out successfully",
      success: true,
    },
    {
      status: 200,
    }
  );
}
