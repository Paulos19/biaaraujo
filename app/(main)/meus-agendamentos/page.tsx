// app/meus-agendamentos/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AppointmentsList } from "./components/appointments-list";
import { format } from "date-fns";

const MeusAgendamentosPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      clientId: session.user.id,
    },
    include: {
      service: true,
    },
    orderBy: {
      startTime: "desc", // Ordena do mais recente para o mais antigo
    },
  });

  // Serializa o campo 'price' para passar para o client component
  const serializableAppointments = appointments.map(app => ({
    ...app,
    service: {
        ...app.service,
        price: app.service.price.toNumber(),
    }
  }));

  const now = new Date();

  // Separa os agendamentos em "próximos" e "histórico"
  const upcomingAppointments = serializableAppointments.filter(app => new Date(app.startTime) > now);
  const pastAppointments = serializableAppointments.filter(app => new Date(app.startTime) <= now);


  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Meus Agendamentos</h1>
      <AppointmentsList 
        upcomingAppointments={upcomingAppointments}
        pastAppointments={pastAppointments}
      />
    </div>
  );
};

export default MeusAgendamentosPage;