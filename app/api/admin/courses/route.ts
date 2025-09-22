// app/api/admin/courses/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const body = await req.json();
    const { title, description, youtubeUrl, published } = body;

    if (!title || !youtubeUrl) {
      return new NextResponse('Título e URL do YouTube são obrigatórios', { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        youtubeUrl,
        published,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('[COURSES_POST_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}