// app/admin/dashboard/agenda/components/create-appointment-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Service } from "@prisma/client";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema de validação com regra para o horário final ser depois do inicial
const formSchema = z.object({
  serviceId: z.string().min(1, { message: "Selecione um serviço." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato de hora inválido (HH:mm)." }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato de hora inválido (HH:mm)." }),
}).refine(data => data.endTime > data.startTime, {
  message: "O horário final deve ser após o horário inicial.",
  path: ["endTime"], // O erro será associado ao campo 'endTime'
});

type AppointmentFormValues = z.infer<typeof formSchema>;

// Tipo auxiliar para dados serializados, onde 'price' é um número
type SerializableService = Omit<Service, "price"> & {
  price: number;
};

interface CreateAppointmentFormProps {
  services: SerializableService[];
  selectedDate: Date;
  onSuccess: () => void;
  onClose: () => void;
}

export const CreateAppointmentForm: React.FC<CreateAppointmentFormProps> = ({ services, selectedDate, onSuccess, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceId: "",
      startTime: "",
      endTime: "",
    },
  });

  async function handleFormSubmit(data: AppointmentFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        date: format(selectedDate, "yyyy-MM-dd"), // Formata a data para a API
      };
      await axios.post("/api/appointments", payload);

      toast.success("Horário disponível criado com sucesso!");
      onSuccess(); // Chama a função para atualizar a lista na página
      onClose();   // Chama a função para fechar o modal
    } catch (error) {
      console.error("Erro ao criar horário:", error);
      toast.error("Ocorreu um erro ao criar o horário.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fim</FormLabel>
                <FormControl>
                  <Input type="time" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="pt-6 space-x-2 flex items-center justify-end w-full">
          <Button disabled={isSubmitting} variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Salvando..." : "Criar Horário"}
          </Button>
        </div>
      </form>
    </Form>
  );
};