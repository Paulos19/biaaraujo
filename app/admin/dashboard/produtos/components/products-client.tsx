// app/admin/dashboard/produtos/components/products-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "./product-form";

// Tipo para dados serializados, esperando 'price' como número
type SerializableProduct = Omit<Product, "price"> & { price: number; };

interface ProductsClientProps {
  data: SerializableProduct[];
}

export const ProductsClient: React.FC<ProductsClientProps> = ({ data }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SerializableProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<SerializableProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (!productToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/products/${productToDelete.id}`);
      toast.success("Produto excluído com sucesso.");
      router.refresh();
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o produto.");
    } finally {
      setLoading(false);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={() => { setIsModalOpen(false); setEditingProduct(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <ProductForm initialData={editingProduct} onClose={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O produto será excluído permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={loading}>{loading ? "Excluindo..." : "Continuar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Produtos Cadastrados ({data.length})</h2>
        <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{`R$ ${product.price.toFixed(2).replace('.', ',')}`}</TableCell>
                <TableCell>
                  <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                    {product.stock > 0 ? `${product.stock} unidades` : "Esgotado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setProductToDelete(product)}>Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};