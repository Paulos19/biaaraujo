// app/api/appointments/[appointmentId]/book/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(
  req: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'CLIENT') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const appointmentId = params.appointmentId;
    const clientId = session.user.id;

    // **A CORREÇÃO ESTÁ AQUI: Usando findFirst em vez de findUnique**
    const appointmentToBook = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        status: 'AVAILABLE',
      },
    });

    if (!appointmentToBook) {
      return new NextResponse('Horário não encontrado ou já agendado', { status: 404 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: 'BOOKED',
        clientId: clientId,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('[APPOINTMENT_BOOK_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}