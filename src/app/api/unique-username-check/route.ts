import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextResponse } from "next/server";
import { z } from "zod";

const UserNameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const queryParam = {
      username: searchParams.get("username"), //localhost:3000/api/uuc?username=arijit  this is how the URL will look
    };

    //validating username
    const result = UserNameQuerySchema.safeParse(queryParam);

    console.log(result);

    if (!result.success) {
      const UsernameErrors = result.error.format().username?._errors || [];

      return NextResponse.json(
        {
          success: false,
          message: "Invalid query Parameters",
        },
        {
          status: 500,
        },
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "username is already taken",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "username is available",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("error checking", error);
    return NextResponse.json(
      {
        message: "username already exists",
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
