import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    console.log(username, email);

    const existingUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "username already exists",
        },
        {
          status: 400,
        },
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "user already exists and verified",
          },
          {
            status: 400,
          },
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        message: [],
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isAcceptingMessage: true,
        isVerified: false,
      });

      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(
      username,
      email,
      verifyCode,
    );

    if (!emailResponse) {
      return NextResponse.json(
        {
          success: false,
          message: "email couldnt be sent",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "email sent successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Error registering User", error);

    return NextResponse.json(
      {
        success: false,
        message: "user cannot be registered",
      },
      {
        status: 500,
      },
    );
  }
}
