// app/admin/dashboard/turmas/components/class-form.tsx
"use client";

import { Resolver, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CourseClass } from "@prisma/client";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Tipo para dados serializados
type SerializableClass = Omit<CourseClass, "price" | "enrollmentDeadline"> & {
  price: number;
  enrollmentDeadline: string;
};

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome da turma é obrigatório." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "O preço é obrigatório." }),
  enrollmentDeadline: z.date().min(new Date(), { message: "O prazo de inscrição é obrigatório." }),
  vacancies: z.coerce.number().int().min(0, { message: "O número de vagas deve ser positivo." }),
});

interface ClassFormProps {
  initialData: SerializableClass | null;
  onClose: () => void;
}

export const ClassForm: React.FC<ClassFormProps> = ({ initialData, onClose }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      enrollmentDeadline: initialData ? new Date(initialData.enrollmentDeadline) : undefined,
    },
  });

  async function handleFormSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const successMessage = initialData ? "Turma atualizada." : "Turma criada.";
      if (initialData) {
        await axios.patch(`/api/admin/course-classes/${initialData.id}`, data);
      } else {
        await axios.post("/api/admin/course-classes", data);
      }
      toast.success(successMessage);
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Algo deu errado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da Turma</FormLabel>
            <FormControl><Input disabled={isSubmitting} placeholder="Ex: Turma de Outubro" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="description" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl><Textarea disabled={isSubmitting} placeholder="Detalhes sobre a turma..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField name="price" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Preço (R$)</FormLabel>
              <FormControl><Input type="number" step="0.01" disabled={isSubmitting} {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="vacancies" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Vagas</FormLabel>
              <FormControl><Input type="number" disabled={isSubmitting} {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="enrollmentDeadline" control={form.control} render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Prazo de Inscrição</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? (format(field.value, "PPP", { locale: ptBR })) : (<span>Escolha uma data</span>)}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="pt-6 space-x-2 flex items-center justify-end w-full">
          <Button disabled={isSubmitting} variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button disabled={isSubmitting} type="submit">{isSubmitting ? 'Salvando...' : (initialData ? 'Salvar' : 'Criar Turma')}</Button>
        </div>
      </form>
    </Form>
  );
};