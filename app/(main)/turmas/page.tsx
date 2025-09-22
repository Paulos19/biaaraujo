// app/(main)/turmas/page.tsx
import prisma from "@/lib/prisma";
import { ClassList } from "./components/class-list";

const TurmasPage = async () => {
  const courseClasses = await prisma.courseClass.findMany({
    where: {
      // Mostra apenas turmas cujo prazo de inscrição ainda não passou
      enrollmentDeadline: {
        gte: new Date(),
      },
    },
    include: {
      // Inclui a contagem de quantos usuários já se inscreveram
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: {
      enrollmentDeadline: "asc",
    },
  });

  // Serializa os dados para o client component
  const serializableClasses = courseClasses.map((courseClass) => ({
    ...courseClass,
    price: courseClass.price.toNumber(),
    enrollmentDeadline: courseClass.enrollmentDeadline.toISOString(),
  }));

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Turmas Presenciais</h1>
        <p className="text-lg text-muted-foreground mt-2">Garanta sua vaga em nossos cursos exclusivos.</p>
      </div>
      <ClassList classes={serializableClasses} />
    </div>
  );
};

export default TurmasPage;