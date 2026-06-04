import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { username, content } = await req.json();
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }
    //is user accepting the messages

    if (!user.isAcceptigMessage) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        {
          status: 405,
        },
      );
    }
    const newMsg = {
      content,
      createdAt: new Date(),
    };

    user.message.push(newMsg as Message);
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Message has been delivered to the user",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error has Occured", error);
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
