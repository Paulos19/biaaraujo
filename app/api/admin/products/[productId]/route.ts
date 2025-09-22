// app/api/admin/products/[productId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Rota PATCH para atualizar
export async function PATCH(req: Request, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const body = await req.json();
    const { name, description, price, stock } = body;

    const product = await prisma.product.update({
        where: { id: params.productId },
        data: { name, description, price: parseFloat(price), stock: parseInt(stock, 10) },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_PATCH_ERROR]', error);
    return new NextResponse('Erro Interno', { status: 500 });
  }
}

// Rota DELETE para excluir
export async function DELETE(req: Request, { params }: { params: { productId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
          return new NextResponse('Não autorizado', { status: 401 });
        }
        const product = await prisma.product.delete({
            where: { id: params.productId },
        });
        return NextResponse.json(product);
    } catch (error) {
        console.error('[PRODUCT_DELETE_ERROR]', error);
        return new NextResponse('Erro Interno', { status: 500 });
    }
}