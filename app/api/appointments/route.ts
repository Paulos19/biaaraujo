// app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getDay, parseISO } from 'date-fns';

// Rota POST para criar um novo horário DISPONÍVEL
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const body = await req.json();
    const { serviceId, date, startTime, endTime } = body;

    if (!serviceId || !date || !startTime || !endTime) {
      return new NextResponse('Dados incompletos', { status: 400 });
    }
    
    // Combina a data com a hora para criar objetos Date completos
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const appointment = await prisma.appointment.create({
      data: {
        serviceId,
        date: new Date(date),
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'AVAILABLE', // O admin sempre cria horários como 'Disponível'
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('[APPOINTMENTS_POST_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}

// Rota GET para buscar os horários de um dia específico
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
          return new NextResponse('Não autorizado', { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');

        if (!date) {
            return new NextResponse('Data não fornecida', { status: 400 });
        }

        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                service: true, // Inclui os dados do serviço relacionado
                client: true,  // Inclui os dados do cliente (se houver)
            },
            orderBy: {
                startTime: 'asc',
            },
        });

        return NextResponse.json(appointments);

    } catch (error) {
        console.error('[APPOINTMENTS_GET_ERROR]', error);
        return new NextResponse('Erro Interno do Servidor', { status: 500 });
    }
}