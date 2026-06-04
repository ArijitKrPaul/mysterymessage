import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, code } = await req.json();

    const decodedUsername = decodeURIComponent(username); //decodeURIComponent decodes the value that is present in a coded form in the URL

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 405,
        },
      );
    }

    const isCodeValid = user.verifyCode === code;

    const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeExpired) {
      user.isVerified = true;
      await user.save();
      return NextResponse.json(
        {
          success: true,
          message: "Account Verified Successfullly",
        },
        {
          status: 200,
        },
      );
    } else if (!isCodeExpired) {
      return NextResponse.json(
        {
          success: false,
          message: "Code has expired",
        },
        {
          status: 500,
        },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter correct verification code",
        },
        {
          status: 500,
        },
      );
    }
  } catch (error) {
    console.log("error has occured", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error has occured",
      },
      {
        status: 405,
      },
    );
  }
}
