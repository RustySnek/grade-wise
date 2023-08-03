import argon2 from "argon2";
import {prisma} from "../../../utils/seed";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {name, password} = body;
  if(!name || !password) {
    return new NextResponse("Missing name, email or password", {status: 400});
  }
  const exist = await prisma.user_credentials.findFirst({
    where: {
      username: name
    }
  });
  if (exist) {
  return new NextResponse("Already exists", {status: 400});
  }
  const hash_password = await argon2.hash(password);
  const user = await prisma.user_credentials.create({
    data: {
      username: name,
      password: hash_password,
      user_id: 0
    }
  });
  return NextResponse.json(user)
}

