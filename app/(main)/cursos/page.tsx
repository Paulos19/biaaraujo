// app/(main)/cursos/page.tsx
import prisma from "@/lib/prisma";
import { CourseList } from "./components/course-list";

const CursosPage = async () => {
  const courses = await prisma.course.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Nossos Cursos</h1>
        <p className="text-lg text-muted-foreground mt-2">Aprenda as melhores técnicas com Bia Araujo.</p>
      </div>
      <CourseList courses={courses} />
    </div>
  );
};

export default CursosPage;