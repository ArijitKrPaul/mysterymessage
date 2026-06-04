import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import { User } from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "../auth/[...nextauth]/options";

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

  const userId = new mongoose.Types.ObjectId(user._id);
  //during using aggregation pipelines in mongodb the string datatype of user._id can give error so we convert it into mongodb object type

  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$message" },
      { $sort: { "$message.createdAt": -1 } },
      { $group: { _id: "$_id", message: { $push: "$message" } } },
    ]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "user not found",
        },
        {
          status: 500,
        },
      );
    }
    return NextResponse.json({
      success: false,
      message: "Returning all the messages",
      messages: user[0].message,
    });
  } catch (error) {
    console.log("Error has taken place", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
