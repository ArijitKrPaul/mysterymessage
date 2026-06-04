import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import { auth } from "../auth/[...nextauth]/options";

import UserModel from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  const session = await auth();
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      {
        status: 401,
      },
    );
  }

  const userId = user._id;

  const { acceptMessages } = await req.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptigMessage: acceptMessages },
      { new: true },
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update the status of user accepting messages",
        },
        {
          status: 401,
        },
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          message: "Message Acceptance status changed successfully",
        },
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    console.error(
      "Failed to update the status of user accepting messages",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        message: "Error has occured",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(req: Request) {
  await dbConnect();

  const session = await auth();
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      {
        status: 401,
      },
    );
  }

  const userId = user._id;

  try {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          message: "User found",
          isAcceptingMessages: existingUser.isAcceptigMessage,
        },
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    console.error("User not found", error);
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
}
