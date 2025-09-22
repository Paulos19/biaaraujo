// app/meus-agendamentos/components/appointments-list.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Appointment, Service } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import axios from 'axios';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type SerializableService = Omit<Service, 'price'> & { price: number };
type SerializableAppointment = Omit<Appointment, 'service'> & { service: SerializableService };

interface AppointmentsListProps {
  upcomingAppointments: SerializableAppointment[];
  pastAppointments: SerializableAppointment[];
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({ upcomingAppointments, pastAppointments }) => {
    const router = useRouter();
    const [appointmentToCancel, setAppointmentToCancel] = useState<SerializableAppointment | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);

    const handleCancel = async () => {
        if (!appointmentToCancel) return;

        setIsCanceling(true);
        try {
            await axios.patch(`/api/appointments/${appointmentToCancel.id}/cancel`);
            toast.success("Agendamento cancelado com sucesso.");
            setAppointmentToCancel(null);
            router.refresh(); // Atualiza a página para refletir a mudança
        } catch (error) {
            toast.error("Não foi possível cancelar o agendamento.");
        } finally {
            setIsCanceling(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'BOOKED': return <Badge>Confirmado</Badge>;
            case 'CANCELED': return <Badge variant="destructive">Cancelado</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    }

  return (
    <div className="space-y-8">
      {/* Seção de Próximos Agendamentos */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Próximos Agendamentos</h2>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map(app => (
              <Card key={app.id}>
                <CardHeader>
                  <CardTitle>{app.service.name}</CardTitle>
                  <CardDescription>
                    {format(new Date(app.startTime), "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                    <div>
                        <p><strong>Horário:</strong> {format(new Date(app.startTime), 'HH:mm')}</p>
                        <p><strong>Status:</strong> {getStatusBadge(app.status)}</p>
                    </div>
                    {app.status === 'BOOKED' && (
                        <Button variant="destructive" size="sm" onClick={() => setAppointmentToCancel(app)}>
                            Cancelar
                        </Button>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Você não tem nenhum agendamento futuro.</p>
        )}
      </section>

      {/* Seção de Histórico */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Histórico de Agendamentos</h2>
        {pastAppointments.length > 0 ? (
          <div className="space-y-4">
            {pastAppointments.map(app => (
              <Card key={app.id}>
                {/* ... (Estrutura similar ao card de cima, mas sem o botão de cancelar) ... */}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Você ainda não tem um histórico de agendamentos.</p>
        )}
      </section>

      {/* Modal de confirmação para cancelamento */}
      <AlertDialog open={!!appointmentToCancel} onOpenChange={() => setAppointmentToCancel(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja cancelar seu agendamento de <strong>{appointmentToCancel?.service.name}</strong> no dia <strong>{appointmentToCancel ? format(new Date(appointmentToCancel.startTime), "dd/MM/yyyy 'às' HH:mm") : ''}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isCanceling}>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} disabled={isCanceling} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                  {isCanceling ? 'Cancelando...' : 'Sim, cancelar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
    </div>
  );
};