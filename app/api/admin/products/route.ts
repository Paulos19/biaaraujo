// app/api/admin/products/route.ts
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
    const { name, description, price, stock } = body;

    if (!name || price === undefined || stock === undefined) {
      return new NextResponse('Dados incompletos', { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCTS_POST_ERROR]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}