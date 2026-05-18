import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { ErrorResponse } from "@/types/ErrorResponse";
import bcrypt from "bcryptjs";

export async function POST(request: Request): Promise<ErrorResponse> {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserByUsername) {
      return {
        success: false,
        message: "username already exists",
        status: 400,
      };
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return {
          status: 400,
          message: "user already exists and verified",
          success: false,
        };
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
        username: username,
        email: email,
        password: hashedPassword,
        message: [],
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isAcceptigMessage: true,
        isVerified: false,
      });

      await newUser.save();
    }
    //send verification mail
    const emailResponse = await sendVerificationEmail(
      username,
      email,
      verifyCode,
    );

    if (!emailResponse) {
      return {
        status: 300,
        message: "email couldnt be sent",
        success: false,
      };
    }
    return {
      status: 201,
      message: "email sent successfully",
      success: true,
    };
  } catch (error) {
    console.error("Error registering User", error);

    return {
      success: false,
      message: "user cannot be registered",
      status: 500,
    };
  }
}
