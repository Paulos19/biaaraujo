// app/admin/dashboard/cursos/components/courses-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Course } from "@prisma/client";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CourseForm } from "./course-form";

interface CoursesClientProps {
  data: Course[];
}

export const CoursesClient: React.FC<CoursesClientProps> = ({ data }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (!courseToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/courses/${courseToDelete.id}`);
      toast.success("Curso excluído com sucesso.");
      router.refresh();
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o curso.");
    } finally {
      setLoading(false);
      setCourseToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={() => { setIsModalOpen(false); setEditingCourse(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Editar Curso" : "Novo Curso"}</DialogTitle>
          </DialogHeader>
          <CourseForm initialData={editingCourse} onClose={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O curso será excluído permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={loading}>{loading ? "Excluindo..." : "Continuar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Cursos Cadastrados ({data.length})</h2>
        <Button onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Curso
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>
                  <Badge variant={course.published ? "default" : "secondary"}>
                    {course.published ? "Publicado" : "Rascunho"}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(course.createdAt), "dd/MM/yyyy")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingCourse(course); setIsModalOpen(true); }}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCourseToDelete(course)}>Excluir</DropdownMenuItem>
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