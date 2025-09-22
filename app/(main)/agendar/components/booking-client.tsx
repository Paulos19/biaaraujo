// app/agendar/components/booking-client.tsx
"use client";

import { useState, useEffect } from "react";
import { Service, Appointment } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarIcon, Clock } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Tipos auxiliares
type SerializableService = Omit<Service, "price"> & {
  price: number;
};

// **NOVO TIPO PARA O AGENDAMENTO COM O SERVIÇO INCLUÍDO**
type AppointmentWithService = Appointment & {
  service: Service;
};

interface BookingClientProps {
  services: SerializableService[];
}

export const BookingClient: React.FC<BookingClientProps> = ({ services }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [selectedService, setSelectedService] = useState<SerializableService | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  // **TIPO DO ESTADO ATUALIZADO**
  const [availableSlots, setAvailableSlots] = useState<AppointmentWithService[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  // **TIPO DO ESTADO ATUALIZADO**
  const [selectedSlot, setSelectedSlot] = useState<AppointmentWithService | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (date) {
      fetchAvailableSlots(date);
    }
  }, [date]);

  const fetchAvailableSlots = async (selectedDate: Date) => {
    setLoadingSlots(true);
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const response = await axios.get(`/api/public/appointments?date=${dateString}`);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error("Erro ao buscar horários", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    if (!session) {
      toast.error("Você precisa estar logado para agendar.");
      router.push('/login');
      return;
    }

    setIsBooking(true);
    try {
      await axios.patch(`/api/appointments/${selectedSlot.id}/book`);
      toast.success("Agendamento realizado com sucesso!");
      setSelectedSlot(null);
      if (date) fetchAvailableSlots(date); // Atualiza a lista de horários
    } catch (error) {
      toast.error("Este horário não está mais disponível.");
    } finally {
      setIsBooking(false);
    }
  };

  const slotsByService = selectedService
    ? availableSlots.filter(slot => slot.serviceId === selectedService.id)
    : [];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 flex flex-col gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">1. Escolha o Serviço</h3>
            <Select onValueChange={(serviceId) => setSelectedService(services.find(s => s.id === serviceId) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card className="w-fit">
          <CardContent className="p-0">
            <div className="p-4 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              <h3 className="text-lg font-semibold">2. Escolha a Data</h3>
            </div>
            <Calendar mode="single" selected={date} onSelect={setDate} className="p-4 pt-0" locale={ptBR} disabled={(day) => day < new Date(new Date().toDateString())} />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-6 w-6" />
              <h3 className="text-lg font-semibold">3. Escolha o Horário</h3>
            </div>
            {!selectedService ? (
              <p className="text-center text-muted-foreground p-8">Selecione um serviço para ver os horários.</p>
            ) : loadingSlots ? (
              <p className="text-center text-muted-foreground p-8">Carregando horários...</p>
            ) : slotsByService.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {slotsByService.map(slot => (
                  <Button key={slot.id} variant="outline" onClick={() => setSelectedSlot(slot)}>
                    {format(new Date(slot.startTime), 'HH:mm')}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-8">Nenhum horário disponível para este dia.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              {/* O erro não acontecerá mais pois o tipo está correto */}
              Você deseja agendar o serviço de <strong>{selectedSlot?.service.name}</strong> para o dia <strong>{date ? format(date, "dd/MM/yyyy") : ''}</strong> às <strong>{selectedSlot ? format(new Date(selectedSlot.startTime), 'HH:mm') : ''}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBooking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBooking} disabled={isBooking}>
              {isBooking ? 'Agendando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};