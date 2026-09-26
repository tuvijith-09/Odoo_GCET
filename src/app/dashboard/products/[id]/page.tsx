import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockQuants: { include: { location: true } },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Update Product</h1>
        <p className="text-slate-500 mt-1">
          Edit details, category, pricing, and reordering rules for {product.name}
        </p>
      </div>

      <EditProductForm product={product} />
    </div>
  );
}
