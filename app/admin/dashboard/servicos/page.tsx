// app/admin/dashboard/servicos/page.tsx
import prisma from "@/lib/prisma";
import { ServicosClient } from "./components/servicos-client";
// Não precisamos mais do tipo Service aqui diretamente para a prop
// import { Service } from "@prisma/client";

const ServicosPage = async () => {
  const services = await prisma.service.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // **CONVERSÃO DOS DADOS AQUI**
  // Mapeamos a lista de serviços para criar objetos simples
  // convertendo o Decimal para um number.
  const serializableServices = services.map((service) => ({
    ...service,
    price: service.price.toNumber(),
  }));

  return (
    <div className="p-6">
      {/* Passamos os dados já serializados para o client component */}
      <ServicosClient data={serializableServices} />
    </div>
  );
};

export default ServicosPage;