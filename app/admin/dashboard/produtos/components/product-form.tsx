// app/admin/dashboard/produtos/components/product-form.tsx
"use client";

import { Resolver, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Tipo para dados serializados, esperando 'price' como número
type SerializableProduct = Omit<Product, "price"> & { price: number; };

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome do produto é obrigatório." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "O preço deve ser um valor positivo." }),
  stock: z.coerce.number().int().min(0, { message: "O estoque deve ser um número inteiro positivo." }),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: SerializableProduct | null;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onClose }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as Resolver<ProductFormValues>,
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || undefined,
      price: initialData.price,
      stock: initialData.stock,
    } : {
      name: "",
      description: "",
      price: 0,
      stock: 0,
    },
  });

  async function handleFormSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const successMessage = initialData ? "Produto atualizado." : "Produto criado.";
      if (initialData) {
        await axios.patch(`/api/admin/products/${initialData.id}`, data);
      } else {
        await axios.post("/api/admin/products", data);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} placeholder="Ex: Shampoo Hidratante" {...field} />
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
                <Textarea disabled={isSubmitting} placeholder="Detalhes do produto..." {...field} />
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
                  <Input type="number" step="0.01" disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque</FormLabel>
                <FormControl>
                  <Input type="number" disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
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
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar alterações' : 'Criar Produto')}
          </Button>
        </div>
      </form>
    </Form>
  );
};