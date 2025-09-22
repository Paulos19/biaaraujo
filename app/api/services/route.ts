// app/api/services/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Rota GET para listar todos os serviços
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('[SERVICES_GET_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}

// Rota POST para criar um novo serviço
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, duration } = body;

    if (!name || !price || !duration) {
      return new NextResponse('Dados incompletos', { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration, 10), 
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('[SERVICES_POST_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}