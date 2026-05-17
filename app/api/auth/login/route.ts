import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken, getSessionCookieOptions } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1, "Логін не може бути порожнім"),
  password: z.string().min(1, "Пароль не може бути порожнім"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, password } = result.data;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json(
        { error: "Невірний логін або пароль" },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Невірний логін або пароль" },
        { status: 401 }
      );
    }

    const token = await createToken({ userId: user.id, username: user.username });
    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({ success: true, username: user.username });
    response.cookies.set(cookieOptions.name, token, {
      maxAge: cookieOptions.maxAge,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}
