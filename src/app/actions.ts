"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function validateReceipt(moveId: string) {
  const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
  if (!move || move.status === "Done") return { error: "Move not found or already done." };

  if (move.toLocationId) {
    const quant = await prisma.stockQuant.findUnique({
      where: {
        productId_locationId: {
          productId: move.productId,
          locationId: move.toLocationId,
        },
      },
    });

    if (quant) {
      await prisma.stockQuant.update({
        where: { id: quant.id },
        data: { quantity: quant.quantity + move.quantity },
      });
    } else {
      await prisma.stockQuant.create({
        data: {
          productId: move.productId,
          locationId: move.toLocationId,
          quantity: move.quantity,
        },
      });
    }
  }

  await prisma.stockMove.update({
    where: { id: moveId },
    data: { status: "Done" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/receipts");
  revalidatePath("/dashboard/history");
  return { success: true };
}

export async function validateDelivery(moveId: string) {
  const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
  if (!move || move.status === "Done") return { error: "Move not found or already done." };

  if (move.fromLocationId) {
    const quant = await prisma.stockQuant.findUnique({
      where: {
        productId_locationId: {
          productId: move.productId,
          locationId: move.fromLocationId,
        },
      },
    });

    if (quant) {
      const newQty = quant.quantity - move.quantity;
      if (newQty < 0) return { error: "Insufficient stock at source location." };
      await prisma.stockQuant.update({
        where: { id: quant.id },
        data: { quantity: newQty },
      });
    } else {
      return { error: "No stock found at this location." };
    }
  }

  await prisma.stockMove.update({
    where: { id: moveId },
    data: { status: "Done" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/deliveries");
  revalidatePath("/dashboard/history");
  return { success: true };
}

export async function validateInternalTransfer(moveId: string) {
  const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
  if (!move || move.status === "Done") return { error: "Move not found or already done." };

  if (move.fromLocationId) {
    const fromQuant = await prisma.stockQuant.findUnique({
      where: {
        productId_locationId: {
          productId: move.productId,
          locationId: move.fromLocationId,
        },
      },
    });
    if (fromQuant) {
      const newQty = fromQuant.quantity - move.quantity;
      if (newQty < 0) return { error: "Insufficient stock at source location." };
      await prisma.stockQuant.update({
        where: { id: fromQuant.id },
        data: { quantity: newQty },
      });
    } else {
      return { error: "No stock found at source location." };
    }
  }

  if (move.toLocationId) {
    const toQuant = await prisma.stockQuant.findUnique({
      where: {
        productId_locationId: {
          productId: move.productId,
          locationId: move.toLocationId,
        },
      },
    });
    if (toQuant) {
      await prisma.stockQuant.update({
        where: { id: toQuant.id },
        data: { quantity: toQuant.quantity + move.quantity },
      });
    } else {
      await prisma.stockQuant.create({
        data: {
          productId: move.productId,
          locationId: move.toLocationId,
          quantity: move.quantity,
        },
      });
    }
  }

  await prisma.stockMove.update({
    where: { id: moveId },
    data: { status: "Done" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transfers");
  revalidatePath("/dashboard/history");
  return { success: true };
}

export async function cancelMove(moveId: string, returnPath: string) {
  await prisma.stockMove.update({
    where: { id: moveId },
    data: { status: "Canceled" },
  });
  revalidatePath("/dashboard");
  revalidatePath(returnPath);
  revalidatePath("/dashboard/history");
  return { success: true };
}
