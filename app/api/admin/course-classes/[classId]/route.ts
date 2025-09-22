// app/api/admin/course-classes/[classId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Rota PATCH para atualizar
export async function PATCH(req: Request, { params }: { params: { classId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const body = await req.json();
    const { name, description, price, enrollmentDeadline } = body;

    const courseClass = await prisma.courseClass.update({
        where: { id: params.classId },
        data: { name, description, price: parseFloat(price), enrollmentDeadline: new Date(enrollmentDeadline) },
    });
    return NextResponse.json(courseClass);
  } catch (error) {
    console.error('[COURSE_CLASS_PATCH_ERROR]', error);
    return new NextResponse('Erro Interno', { status: 500 });
  }
}

// Rota DELETE para excluir
export async function DELETE(req: Request, { params }: { params: { classId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
          return new NextResponse('Não autorizado', { status: 401 });
        }
        const courseClass = await prisma.courseClass.delete({
            where: { id: params.classId },
        });
        return NextResponse.json(courseClass);
    } catch (error) {
        console.error('[COURSE_CLASS_DELETE_ERROR]', error);
        return new NextResponse('Erro Interno', { status: 500 });
    }
}