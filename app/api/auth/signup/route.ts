import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        {
          status: 400,
          message: "Name is required",
          success: false,
        },
        {
          status: 400,
        }
      );
    }

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

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return NextResponse.json(
        {
          status: 400,
          message: error.message,
          success: false,
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: 400,
          message: "User already exists",
          success: false,
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: 400,
          message: "User creation failed",
          success: false,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        status: 200,
        message: "User created successfully",
        success: true,
        user: data.user,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
