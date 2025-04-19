import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || email.trim() === "") {
    return NextResponse.json(
      {
        status: 400,
        message: "Email is required",
        success: false,
      },
      {
        status: 400,
      }
    );
  }

  if (!password || password.trim() === "") {
    return NextResponse.json(
      {
        status: 400,
        message: "Password is required",
        success: false,
      },
      {
        status: 400,
      }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      {
        status: 401,
        message: error.message,
        success: false,
      },
      {
        status: 401,
      }
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive'
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        status: 404,
        message: "User not found",
        success: false,
      },
      {
        status: 404,
      }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json(
      {
        status: 401,
        message: "Invalid credentials",
        success: false,
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.json({
    message: "Login successful",
    user: data.user,
    session: data.session,
  });
}
