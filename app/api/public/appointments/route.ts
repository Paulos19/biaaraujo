// app/api/public/appointments/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');

        if (!date) {
            return new NextResponse('Data não fornecida', { status: 400 });
        }

        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        const availableAppointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: 'AVAILABLE', // Apenas horários disponíveis
            },
            include: {
                service: true, // Inclui os dados do serviço
            },
            orderBy: {
                startTime: 'asc',
            },
        });

        return NextResponse.json(availableAppointments);

    } catch (error) {
        console.error('[PUBLIC_APPOINTMENTS_GET_ERROR]', error);
        return new NextResponse('Erro Interno do Servidor', { status: 500 });
    }
}