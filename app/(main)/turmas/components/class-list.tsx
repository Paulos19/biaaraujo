// app/(main)/turmas/components/class-list.tsx
"use client";

import { useState } from "react";
import { CourseClass } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

type SerializableClass = Omit<CourseClass, "price" | "enrollmentDeadline"> & {
  price: number;
  enrollmentDeadline: string;
  _count: { enrollments: number };
};

interface ClassListProps {
  classes: SerializableClass[];
}

export const ClassList: React.FC<ClassListProps> = ({ classes }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [classToEnroll, setClassToEnroll] = useState<SerializableClass | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (!classToEnroll) return;
    if (!session) {
      toast.error("Você precisa estar logado para se inscrever.");
      router.push('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      await axios.post(`/api/course-classes/${classToEnroll.id}/enroll`);
      toast.success("Inscrição realizada com sucesso!");
      setClassToEnroll(null);
      router.refresh();
    } catch (error: any) {
      toast.error("Falha na inscrição", { description: error.response?.data || "Tente novamente." });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map((turma) => {
          const remainingVacancies = turma.vacancies - turma._count.enrollments;
          const isSoldOut = remainingVacancies <= 0;

          return (
            <Card key={turma.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{turma.name}</CardTitle>
                <CardDescription>{turma.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p><strong>Preço:</strong> R$ {turma.price.toFixed(2).replace('.', ',')}</p>
                <p><strong>Prazo de Inscrição:</strong> {format(new Date(turma.enrollmentDeadline), "dd/MM/yyyy")}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Badge variant={isSoldOut ? "destructive" : "secondary"}>
                  {isSoldOut ? "Esgotado" : `${remainingVacancies} vagas restantes`}
                </Badge>
                <Button onClick={() => setClassToEnroll(turma)} disabled={isSoldOut}>
                  Inscrever-se
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Modal de confirmação para inscrição */}
      <AlertDialog open={!!classToEnroll} onOpenChange={() => setClassToEnroll(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Inscrição</AlertDialogTitle>
            <AlertDialogDescription>
              Você confirma a sua inscrição na turma <strong>{classToEnroll?.name}</strong> pelo valor de <strong>R$ {classToEnroll?.price.toFixed(2).replace('.', ',')}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEnrolling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnroll} disabled={isEnrolling}>
              {isEnrolling ? 'Inscrevendo...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};