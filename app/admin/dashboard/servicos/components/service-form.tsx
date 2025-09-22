// app/admin/dashboard/servicos/components/service-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Service } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";

// **TIPO AUXILIAR PARA DADOS SERIALIZADOS**
// Este tipo garante que o formulário espere 'price' como um número.
type SerializableService = Omit<Service, "price"> & {
  price: number;
};

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "O preço deve ser positivo." }),
  duration: z.coerce.number().int().min(1, { message: "A duração deve ser de pelo menos 1 minuto." }),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  // **A PROP AGORA USA O TIPO CORRETO**
  initialData: SerializableService | null;
  onClose: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, onClose }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonText = initialData ? "Salvar alterações" : "Criar Serviço";
  const successMessage = initialData ? "Serviço atualizado." : "Serviço criado.";

  const form = useForm<z.input<typeof formSchema>, any, z.output<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price.toString() || "0",
      duration: initialData?.duration.toString() || "30",
    },
  });

  async function handleFormSubmit(data: ServiceFormValues) {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await axios.patch(`/api/services/${initialData.id}`, data);
      } else {
        await axios.post("/api/services", data);
      }
      toast.success(successMessage);
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar o serviço:", error);
      toast.error("Algo deu errado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* O restante do JSX continua igual */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} placeholder="Ex: Corte de Cabelo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} placeholder="Uma breve descrição do serviço" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={isSubmitting}
                    placeholder="50.00"
                    {...field}
                    value={field.value?.toString()}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (minutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={isSubmitting}
                    placeholder="60"
                    {...field}
                    value={field.value?.toString()}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
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
            {isSubmitting ? "Salvando..." : buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
};