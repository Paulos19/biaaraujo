// app/api/admin/courses/[courseId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Rota PATCH para atualizar um curso
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const body = await req.json();
    const { title, description, youtubeUrl, published } = body;

    const updatedCourse = await prisma.course.update({
      where: { id: params.courseId },
      data: {
        title,
        description,
        youtubeUrl,
        published,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('[COURSE_PATCH_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}

// Rota DELETE para excluir um curso
export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
          return new NextResponse('Não autorizado', { status: 401 });
        }

        const deletedCourse = await prisma.course.delete({
            where: { id: params.courseId },
        });

        return NextResponse.json(deletedCourse);
    } catch (error) {
        console.error('[COURSE_DELETE_ERROR]', error);
        return new NextResponse('Erro Interno do Servidor', { status: 500 });
    }
}