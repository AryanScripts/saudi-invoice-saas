import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const requestOtpSchema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = requestOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide a valid email address.",
          },
        },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("OTP request failed:", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "OTP_REQUEST_FAILED",
            message: "Unable to send OTP. Please try again later.",
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email,
        message: "OTP sent successfully.",
      },
      message: "A verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Request OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong. Please try again later.",
        },
      },
      { status: 500 },
    );
  }
}
