// app/api/appointments/[appointmentId]/cancel/route.ts
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

    // Busca o agendamento para garantir que ele pertence ao usuário logado
    const appointmentToCancel = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        clientId: clientId, // A verificação de segurança crucial!
      },
    });

    if (!appointmentToCancel) {
      return new NextResponse('Agendamento não encontrado ou não pertence a você', { status: 404 });
    }
    
    // Não permitir cancelamento de horários que já passaram
    if (new Date(appointmentToCancel.startTime) < new Date()) {
        return new NextResponse('Não é possível cancelar agendamentos passados', { status: 400 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: 'CANCELED',
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('[APPOINTMENT_CANCEL_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}