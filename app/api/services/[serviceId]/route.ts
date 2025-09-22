// app/api/services/[serviceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(
  request: NextRequest,
  context: { params: { serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { serviceId } = context.params;

    if (!serviceId) {
      return new NextResponse('ID do serviço não encontrado', { status: 400 });
    }

    const deletedService = await prisma.service.delete({
      where: {
        id: serviceId,
      },
    });

    return NextResponse.json(deletedService);
  } catch (error) {
    console.error('[SERVICE_DELETE_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { serviceId } = context.params;

    if (!serviceId) {
      return new NextResponse('ID do serviço não encontrado', { status: 400 });
    }

    const body = await request.json();
    const { name, description, price, duration } = body;

    if (!name || !price || !duration) {
      return new NextResponse('Dados incompletos', { status: 400 });
    }

    const updatedService = await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration, 10),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('[SERVICE_PATCH_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}