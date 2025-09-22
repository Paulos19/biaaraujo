// app/admin/dashboard/cursos/page.tsx
import prisma from "@/lib/prisma";
import { CoursesClient } from "./components/courses-client";

const CursosPage = async () => {
  // Busca os dados diretamente do banco no servidor
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6">
      <CoursesClient data={courses} />
    </div>
  );
};

export default CursosPage;