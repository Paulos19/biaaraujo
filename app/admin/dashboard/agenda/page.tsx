// app/dashboard/agenda/page.tsx
import prisma from "@/lib/prisma";
import { AgendaClient } from "./components/agenda-client";

const AgendaPage = async () => {
  // Busca todos os serviços para popular o formulário de criação
  const services = (await prisma.service.findMany()).map((service) => ({
    ...service,
    price: service.price.toNumber(),
  }));

  return (
    <div className="p-6">
      <AgendaClient services={services} />
    </div>
  );
};

export default AgendaPage;