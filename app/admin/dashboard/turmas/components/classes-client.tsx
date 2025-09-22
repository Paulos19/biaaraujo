// app/admin/dashboard/turmas/components/classes-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CourseClass } from "@prisma/client";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClassForm } from "./class-form";

// Tipo para dados serializados
type SerializableClass = Omit<CourseClass, "price" | "enrollmentDeadline"> & { 
  price: number;
  enrollmentDeadline: string;
};

interface ClassesClientProps {
  data: SerializableClass[];
}

export const ClassesClient: React.FC<ClassesClientProps> = ({ data }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SerializableClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<SerializableClass | null>(null);
  const [loading, setLoading] = useState(false);

  const onDelete = async () => { /* ... (Lógica de exclusão, similar à de produtos) ... */ };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={() => { setIsModalOpen(false); setEditingClass(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingClass ? "Editar Turma" : "Nova Turma"}</DialogTitle></DialogHeader>
          <ClassForm initialData={editingClass} onClose={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
        {/* ... (Conteúdo do AlertDialog para confirmação de exclusão) ... */}
      </AlertDialog>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Turmas Cadastradas ({data.length})</h2>
        <Button onClick={() => { setEditingClass(null); setIsModalOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Turma
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Turma</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Prazo de Inscrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((turma) => (
              <TableRow key={turma.id}>
                <TableCell className="font-medium">{turma.name}</TableCell>
                <TableCell>{`R$ ${turma.price.toFixed(2).replace('.', ',')}`}</TableCell>
                <TableCell>{format(new Date(turma.enrollmentDeadline), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingClass(turma); setIsModalOpen(true); }}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setClassToDelete(turma)}>Excluir</DropdownMenuItem>
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