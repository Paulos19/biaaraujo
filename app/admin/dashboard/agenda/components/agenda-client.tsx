// app/admin/dashboard/agenda/components/agenda-client.tsx
"use client";

import { useState, useEffect } from "react";
import { Service, Appointment, User } from "@prisma/client";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateAppointmentForm } from "./create-appointment-form";

// Tipo estendido para incluir as relações
type AppointmentWithDetails = Appointment & {
  service: Service;
  client: User | null;
};

// Tipo auxiliar para dados serializados, onde 'price' é um número
type SerializableService = Omit<Service, "price"> & {
  price: number;
};

interface AgendaClientProps {
  services: SerializableService[];
}

export const AgendaClient: React.FC<AgendaClientProps> = ({ services }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal

  useEffect(() => {
    if (date) {
      fetchAppointments(date);
    }
  }, [date]);

  const fetchAppointments = async (selectedDate: Date) => {
    setLoading(true);
    try {
      // Formata a data para YYYY-MM-DD para a API
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const response = await axios.get(`/api/appointments?date=${dateString}`);
      setAppointments(response.data);
    } catch (error) { // <-- O ERRO ESTAVA AQUI (faltavam as chaves {})
      console.error("Erro ao buscar agendamentos", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Disponível";
      case "BOOKED":
        return "Agendado";
      case "CANCELED":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  // Função para ser chamada após a criação bem-sucedida de um horário
  const onAppointmentCreated = () => {
    if (date) {
      fetchAppointments(date); // Re-busca os horários para o dia atual
    }
  };

  return (
    <>
      {/* Modal de Criação de Horário */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Horário Disponível</DialogTitle>
          </DialogHeader>
          {date && (
            <CreateAppointmentForm
              services={services}
              selectedDate={date}
              onSuccess={onAppointmentCreated}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna do Calendário */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-4"
                locale={ptBR}
                disabled={(day) => day < new Date(new Date().toDateString())}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna da Agenda do Dia */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Agenda para{" "}
                  {date
                    ? format(date, "dd 'de' MMMM", { locale: ptBR })
                    : "Nenhum dia selecionado"}
                </CardTitle>
                {/* Botão agora abre o modal */}
                <Button onClick={() => setIsModalOpen(true)} disabled={!date}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Criar Horário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading && <p>Carregando horários...</p>}
              {!loading && appointments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum horário para este dia.
                </p>
              )}
              {!loading && appointments.length > 0 && (
                <ul className="space-y-4">
                  {appointments.map((app) => (
                    <li
                      key={app.id}
                      className="flex justify-between items-center p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-semibold">
                          {format(new Date(app.startTime), "HH:mm")} -{" "}
                          {format(new Date(app.endTime), "HH:mm")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {app.service.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            app.status === "BOOKED"
                              ? "text-orange-500"
                              : "text-green-500"
                          }`}
                        >
                          {getStatusText(app.status)}
                        </p>
                        {app.client && (
                          <p className="text-sm text-muted-foreground">
                            {app.client.name}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};