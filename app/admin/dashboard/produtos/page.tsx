// app/admin/dashboard/produtos/page.tsx
import prisma from "@/lib/prisma";
import { ProductsClient } from "./components/products-client";

const ProdutosPage = async () => {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Serializa o campo 'price' para o client component
  const serializableProducts = products.map((product) => ({
    ...product,
    price: product.price.toNumber(),
  }));

  return (
    <div>
      <ProductsClient data={serializableProducts} />
    </div>
  );
};

export default ProdutosPage;