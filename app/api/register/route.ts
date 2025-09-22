// app/api/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client'; // Importe o enum UserRole

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse('Dados incompletos', { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('Email já cadastrado', { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Lógica para definir a role do usuário
    const userRole: UserRole =
      email === process.env.EMAIL_ADMIN ? UserRole.ADMIN : UserRole.CLIENT;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole, // Atribui a role aqui
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[REGISTER_POST_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}