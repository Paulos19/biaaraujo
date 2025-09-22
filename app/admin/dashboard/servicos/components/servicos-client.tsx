// app/admin/dashboard/servicos/components/servicos-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Service } from "@prisma/client";

// Importações dos componentes Shadcn
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Importa o formulário
import { ServiceForm } from "./service-form";

// NOVO TIPO PARA OS DADOS SERIALIZADOS
// Usa o tipo Service do Prisma, mas substitui 'price' de Decimal para number.
type SerializableService = Omit<Service, "price"> & {
  price: number;
};

interface ServicosClientProps {
  data: SerializableService[]; // A prop 'data' agora usa o novo tipo
}

export const ServicosClient: React.FC<ServicosClientProps> = ({ data }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<SerializableService | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (service: SerializableService) => { // O parâmetro agora usa o novo tipo
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const onDelete = async () => {
    if (!serviceToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/services/${serviceToDelete}`);
      toast.success("Serviço excluído com sucesso.");
      router.refresh(); // Atualiza os dados da página
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o serviço.");
    } finally {
      setLoading(false);
      setServiceToDelete(null);
    }
  };

  return (
    <>
      {/* Modal de Criação/Edição */}
      <Dialog
        open={isModalOpen}
        onOpenChange={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm
            initialData={editingService}
            onClose={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação para exclusão */}
      <AlertDialog
        open={!!serviceToDelete}
        onOpenChange={() => setServiceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir
              permanentemente o serviço.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={loading}>
              {loading ? "Excluindo..." : "Continuar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          Serviços Cadastrados ({data.length})
        </h2>
        <Button onClick={handleNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{`R$ ${service.price
                  .toFixed(2)
                  .replace(".", ",")}`}</TableCell>
                <TableCell>{`${service.duration} min`}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(service)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setServiceToDelete(service.id)}
                      >
                        Excluir
                      </DropdownMenuItem>
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