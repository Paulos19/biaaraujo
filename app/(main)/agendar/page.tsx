// app/agendar/page.tsx
import prisma from "@/lib/prisma";
import { BookingClient } from "./components/booking-client";

const AgendarPage = async () => {
  // Busca todos os serviços para o cliente poder escolher
  const services = await prisma.service.findMany();

  // Serializa os dados para o client component
  const serializableServices = services.map((service) => ({
    ...service,
    price: service.price.toNumber(),
  }));

  return (
    <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Faça seu Agendamento</h1>
        <BookingClient services={serializableServices} />
    </div>
  );
};

export default AgendarPage;