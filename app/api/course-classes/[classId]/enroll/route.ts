// app/api/course-classes/[classId]/enroll/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'CLIENT') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const classId = params.classId;
    const userId = session.user.id;

    // Usamos uma transação para garantir a consistência dos dados
    const result = await prisma.$transaction(async (tx) => {
      // 1. Busca a turma e conta as inscrições atuais DENTRO da transação
      const courseClass = await tx.courseClass.findUnique({
        where: { id: classId },
        include: { _count: { select: { enrollments: true } } },
      });

      if (!courseClass) {
        throw new Error('Turma não encontrada.');
      }

      // 2. Verifica se ainda há vagas
      const enrolledCount = courseClass._count.enrollments;
      if (enrolledCount >= courseClass.vacancies) {
        throw new Error('Não há mais vagas disponíveis para esta turma.');
      }

      // 3. Verifica se o prazo de inscrição já passou
      if (new Date(courseClass.enrollmentDeadline) < new Date()) {
        throw new Error('O prazo de inscrição para esta turma já encerrou.');
      }

      // 4. Verifica se o usuário já está inscrito
      const existingEnrollment = await tx.courseEnrollment.findUnique({
        where: { userId_classId: { userId, classId } },
      });

      if (existingEnrollment) {
        throw new Error('Você já está inscrito nesta turma.');
      }
      
      // 5. Se tudo estiver certo, cria a inscrição
      const newEnrollment = await tx.courseEnrollment.create({
        data: {
          userId,
          classId,
        },
      });

      return newEnrollment;
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[ENROLL_POST_ERROR]', error);
    // Retorna a mensagem de erro específica para o cliente
    return new NextResponse(error.message || 'Erro Interno do Servidor', { status: 400 });
  }
}