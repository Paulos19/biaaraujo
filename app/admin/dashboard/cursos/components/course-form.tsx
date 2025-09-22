// app/admin/dashboard/cursos/components/course-form.tsx
"use client";

import { useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Course } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  description: z.string().nullable().optional(),
  youtubeUrl: z.string().url({ message: "Por favor, insira uma URL do YouTube válida." }),
  published: z.boolean().default(false),
});

type CourseFormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
  initialData: Course | null;
  onClose: () => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({ initialData, onClose }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CourseFormValues>,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description ?? "",
      youtubeUrl: initialData?.youtubeUrl || "",
      published: initialData?.published ?? false,
    } as CourseFormValues,
  });

  async function handleFormSubmit(data: CourseFormValues) {
    setIsSubmitting(true);
    try {
      const successMessage = initialData ? "Curso atualizado." : "Curso criado.";
      if (initialData) {
        await axios.patch(`/api/admin/courses/${initialData.id}`, data);
      } else {
        await axios.post("/api/admin/courses", data);
      }
      toast.success(successMessage);
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Algo deu errado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Curso</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} placeholder="Ex: Técnicas de Penteado" {...field} />
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
                <Textarea disabled={isSubmitting} placeholder="Descreva o conteúdo do curso..." {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="youtubeUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Vídeo no YouTube</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} placeholder="https://www.youtube.com/watch?v=..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Publicado</FormLabel>
                <FormMessage>
                    Se ativo, o curso aparecerá para os clientes.
                </FormMessage>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="pt-6 space-x-2 flex items-center justify-end w-full">
          <Button disabled={isSubmitting} variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar alterações' : 'Criar Curso')}
          </Button>
        </div>
      </form>
    </Form>
  );
};