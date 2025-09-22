// app/api/admin/course-classes/route.ts
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
    const { name, description, price, enrollmentDeadline, vacancies } = body;

    if (!name || price === undefined || !enrollmentDeadline || vacancies === undefined) {
      return new NextResponse('Dados incompletos. Nome, preço, prazo e vagas são obrigatórios.', { status: 400 });
    }

    const courseClass = await prisma.courseClass.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        enrollmentDeadline: new Date(enrollmentDeadline),
        vacancies: parseInt(vacancies, 10),
      },
    });

    return NextResponse.json(courseClass);
  } catch (error) {
    console.error('[COURSE_CLASSES_POST_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}