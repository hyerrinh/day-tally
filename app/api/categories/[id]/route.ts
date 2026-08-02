import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await params;

  const category = await prisma.category.update({
    where: {
      id,
    },
    data: {
      name: body.name,
      normalizedName: body.name,
      icon: body.icon,
    },
  });

  return Response.json(category);
}
