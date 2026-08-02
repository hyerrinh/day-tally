import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany();
  return Response.json(categories);
}

export async function POST(request: Request) {
  const body = await request.json();

  const category = await prisma.category.create({
    data: {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      name: body.name,
      normalizedName: body.name.trim().toLowerCase(),
      icon: body.icon,
      sortOrder: 0,
    },
  });

  return Response.json(category);
}
