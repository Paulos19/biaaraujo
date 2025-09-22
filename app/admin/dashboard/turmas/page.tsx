// app/admin/dashboard/turmas/page.tsx
import prisma from "@/lib/prisma";
import { ClassesClient } from "./components/classes-client";

const TurmasPage = async () => {
  const courseClasses = await prisma.courseClass.findMany({
    orderBy: { enrollmentDeadline: "asc" },
  });

  // Serializa os campos 'price' (Decimal) e 'enrollmentDeadline' (Date)
  const serializableClasses = courseClasses.map((courseClass) => ({
    ...courseClass,
    price: courseClass.price.toNumber(),
    enrollmentDeadline: courseClass.enrollmentDeadline.toISOString(),
  }));

  return (
    <div>
      <ClassesClient data={serializableClasses} />
    </div>
  );
};

export default TurmasPage;