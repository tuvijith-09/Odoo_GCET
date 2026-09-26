"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// --- AUTHENTICATION ACTIONS ---

export async function signUpAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = (formData.get("password") as string)?.trim();
    const role = (formData.get("role") as string) || "STAFF";

    if (!name || !email || !password) {
      return { error: "Please fill in all required fields." };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production use bcrypt; storing string for demo
        role: role === "MANAGER" ? "MANAGER" : "STAFF",
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(
      "auth",
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }),
      { path: "/", maxAge: 60 * 60 * 24 * 7 }
    );

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to sign up.";
    return { error: message };
  }
}

export async function signInAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = (formData.get("password") as string)?.trim();

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    let user = await prisma.user.findUnique({ where: { email } });

    // Fallback/Demo helper: if user does not exist in DB yet, auto-provision default demo account
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0].toUpperCase(),
          password,
          role: "MANAGER",
        },
      });
    } else if (user.password !== password) {
      return { error: "Incorrect password. Please try again or reset password." };
    }

    const cookieStore = await cookies();
    cookieStore.set(
      "auth",
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }),
      { path: "/", maxAge: 60 * 60 * 24 * 7 }
    );

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to sign in.";
    return { error: message };
  }
}

export async function requestOtpAction(emailInput: string) {
  try {
    const email = emailInput.trim().toLowerCase();
    if (!email) return { error: "Please enter your registered email address." };

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Auto-create user for demo convenience if non-existent
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0].toUpperCase(),
          password: "password123",
          role: "STAFF",
        },
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry },
    });

    return {
      success: true,
      message: `OTP sent successfully. For demo purposes, your OTP is: ${otp}`,
      otp,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate OTP.";
    return { error: message };
  }
}

export async function resetPasswordWithOtpAction(
  emailInput: string,
  otpInput: string,
  newPasswordInput: string
) {
  try {
    const email = emailInput.trim().toLowerCase();
    const otp = otpInput.trim();
    const newPassword = newPasswordInput.trim();

    if (!email || !otp || !newPassword) {
      return { error: "Email, OTP, and new password are required." };
    }

    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters long." };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "No account found with this email." };
    }

    if (!user.otp || user.otp !== otp) {
      return { error: "Invalid OTP code. Please verify and try again." };
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return { error: "This OTP code has expired. Please request a new one." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPassword,
        otp: null,
        otpExpiry: null,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reset password.";
    return { error: message };
  }
}

// --- PRODUCT ACTIONS ---

export async function createProductAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const sku = (formData.get("sku") as string)?.trim().toUpperCase();
    const category = (formData.get("category") as string)?.trim();
    const uom = (formData.get("uom") as string) || "pcs";
    const initialStock = Math.max(0, parseInt((formData.get("initialStock") as string) || "0") || 0);
    const costPrice = Math.max(0, parseFloat((formData.get("costPrice") as string) || "0") || 0);
    const minStock = Math.max(0, parseInt((formData.get("minStock") as string) || "10") || 10);
    const reorderQty = Math.max(0, parseInt((formData.get("reorderQty") as string) || "50") || 50);

    if (!name || !sku || !category) {
      return { error: "Name, SKU, and Category are required." };
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return { error: `A product with SKU "${sku}" already exists. Please use a unique SKU.` };
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          sku,
          category,
          uom,
          initialStock,
          costPrice,
          minStock,
          reorderQty,
        },
      });

      if (initialStock > 0) {
        let warehouse = await tx.location.findFirst({ where: { isWarehouse: true } });
        if (!warehouse) {
          warehouse = await tx.location.create({
            data: { name: "Main Warehouse", shortCode: "WH-MAIN", isWarehouse: true },
          });
        }

        await tx.stockQuant.create({
          data: {
            productId: product.id,
            locationId: warehouse.id,
            quantity: initialStock,
          },
        });

        await tx.stockMove.create({
          data: {
            productId: product.id,
            toLocationId: warehouse.id,
            quantity: initialStock,
            documentType: "Receipt",
            status: "Done",
            reference: "INIT-STOCK",
            partner: "Initial Inventory",
          },
        });
      }

      return product;
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/stock");
    return { success: true, product: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product.";
    return { error: message };
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const uom = (formData.get("uom") as string) || "pcs";
    const costPrice = Math.max(0, parseFloat((formData.get("costPrice") as string) || "0") || 0);
    const minStock = Math.max(0, parseInt((formData.get("minStock") as string) || "10") || 10);
    const reorderQty = Math.max(0, parseInt((formData.get("reorderQty") as string) || "50") || 50);

    if (!name || !category) {
      return { error: "Name and Category are required." };
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        category,
        uom,
        costPrice,
        minStock,
        reorderQty,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/stock");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product.";
    return { error: message };
  }
}

// --- LOCATION & WAREHOUSE ACTIONS ---

export async function createWarehouseAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const shortCode = (formData.get("shortCode") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const isWarehouse = formData.get("isWarehouse") === "on";

    if (!name) return { error: "Warehouse / Location name is required." };

    await prisma.location.create({
      data: {
        name,
        shortCode: shortCode || null,
        address: address || null,
        isWarehouse,
      },
    });

    revalidatePath("/dashboard/warehouses");
    revalidatePath("/dashboard/stock");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create location.";
    return { error: message };
  }
}

// --- OPERATION ACTIONS (RECEIPTS, DELIVERIES, TRANSFERS, ADJUSTMENTS) ---

export async function advanceMoveStatus(moveId: string, nextStatus: string) {
  try {
    const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
    if (!move) return { error: "Operation not found." };
    if (move.status === "Done" || move.status === "Canceled") {
      return { error: `Cannot change status of an operation that is ${move.status}.` };
    }

    await prisma.stockMove.update({
      where: { id: moveId },
      data: { status: nextStatus },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/receipts");
    revalidatePath("/dashboard/deliveries");
    revalidatePath("/dashboard/transfers");
    revalidatePath("/dashboard/history");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update status.";
    return { error: message };
  }
}

export async function validateReceipt(moveId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
    if (!move) return { error: "Receipt not found." };
    if (move.status === "Done") return { error: "Receipt is already completed." };
    if (move.status === "Canceled") return { error: "Cannot validate a canceled receipt." };
    if (!move.toLocationId) return { error: "Destination location is missing." };

    await prisma.$transaction(async (tx) => {
      const quant = await tx.stockQuant.findUnique({
        where: {
          productId_locationId: {
            productId: move.productId,
            locationId: move.toLocationId!,
          },
        },
      });

      if (quant) {
        await tx.stockQuant.update({
          where: { id: quant.id },
          data: { quantity: quant.quantity + move.quantity },
        });
      } else {
        await tx.stockQuant.create({
          data: {
            productId: move.productId,
            locationId: move.toLocationId!,
            quantity: move.quantity,
          },
        });
      }

      await tx.stockMove.update({
        where: { id: moveId },
        data: { status: "Done" },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/receipts");
    revalidatePath("/dashboard/stock");
    revalidatePath("/dashboard/history");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to validate receipt.";
    return { error: message };
  }
}

export async function togglePickDelivery(moveId: string) {
  try {
    const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
    if (!move) return { error: "Delivery not found." };
    if (move.status === "Done") return { error: "Already completed." };

    const newPicked = !move.isPicked;
    await prisma.stockMove.update({
      where: { id: moveId },
      data: {
        isPicked: newPicked,
        status: newPicked && move.isPacked ? "Ready" : move.status,
      },
    });

    revalidatePath("/dashboard/deliveries");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update pick status.";
    return { error: message };
  }
}

export async function togglePackDelivery(moveId: string) {
  try {
    const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
    if (!move) return { error: "Delivery not found." };
    if (move.status === "Done") return { error: "Already completed." };

    const newPacked = !move.isPacked;
    await prisma.stockMove.update({
      where: { id: moveId },
      data: {
        isPacked: newPacked,
        status: move.isPicked && newPacked ? "Ready" : move.status,
      },
    });

    revalidatePath("/dashboard/deliveries");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update pack status.";
    return { error: message };
  }
}

export async function validateDelivery(moveId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
    if (!move) return { error: "Delivery order not found." };
    if (move.status === "Done") return { error: "Delivery is already completed." };
    if (move.status === "Canceled") return { error: "Cannot validate a canceled delivery." };
    if (!move.fromLocationId) return { error: "Source location is missing." };

    return await prisma.$transaction(async (tx) => {
      const quant = await tx.stockQuant.findUnique({
        where: {
          productId_locationId: {
            productId: move.productId,
            locationId: move.fromLocationId!,
          },
        },
      });

      if (!quant || quant.quantity < move.quantity) {
        const available = quant ? quant.quantity : 0;
        return {
          error: `Insufficient stock at source location. Available: ${available}, Required: ${move.quantity}`,
        };
      }

      await tx.stockQuant.update({
        where: { id: quant.id },
        data: { quantity: quant.quantity - move.quantity },
      });

      await tx.stockMove.update({
        where: { id: moveId },
        data: { status: "Done", isPicked: true, isPacked: true },
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/deliveries");
      revalidatePath("/dashboard/stock");
      revalidatePath("/dashboard/history");
      return { success: true };
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to validate delivery.";
    return { error: message };
  }
}

export async function validateInternalTransfer(moveId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
    if (!move) return { error: "Transfer not found." };
    if (move.status === "Done") return { error: "Transfer is already completed." };
    if (move.status === "Canceled") return { error: "Cannot validate a canceled transfer." };
    if (!move.fromLocationId || !move.toLocationId) {
      return { error: "Both source and destination locations are required." };
    }
    if (move.fromLocationId === move.toLocationId) {
      return { error: "Source and destination locations must be different." };
    }

    return await prisma.$transaction(async (tx) => {
      const fromQuant = await tx.stockQuant.findUnique({
        where: {
          productId_locationId: {
            productId: move.productId,
            locationId: move.fromLocationId!,
          },
        },
      });

      if (!fromQuant || fromQuant.quantity < move.quantity) {
        const available = fromQuant ? fromQuant.quantity : 0;
        return {
          error: `Insufficient stock at source location. Available: ${available}, Required: ${move.quantity}`,
        };
      }

      // Decrement from source
      await tx.stockQuant.update({
        where: { id: fromQuant.id },
        data: { quantity: fromQuant.quantity - move.quantity },
      });

      // Increment to destination
      const toQuant = await tx.stockQuant.findUnique({
        where: {
          productId_locationId: {
            productId: move.productId,
            locationId: move.toLocationId!,
          },
        },
      });

      if (toQuant) {
        await tx.stockQuant.update({
          where: { id: toQuant.id },
          data: { quantity: toQuant.quantity + move.quantity },
        });
      } else {
        await tx.stockQuant.create({
          data: {
            productId: move.productId,
            locationId: move.toLocationId!,
            quantity: move.quantity,
          },
        });
      }

      await tx.stockMove.update({
        where: { id: moveId },
        data: { status: "Done" },
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/transfers");
      revalidatePath("/dashboard/stock");
      revalidatePath("/dashboard/history");
      return { success: true };
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to validate transfer.";
    return { error: message };
  }
}

export async function recordStockAdjustment(formData: FormData) {
  try {
    const productId = formData.get("productId") as string;
    const locationId = formData.get("locationId") as string;
    const countedQty = parseInt((formData.get("countedQty") as string) || "0");
    const reason = (formData.get("reason") as string)?.trim() || "Physical Count Mismatch";

    if (!productId || !locationId) {
      return { error: "Please select both product and location." };
    }
    if (isNaN(countedQty) || countedQty < 0) {
      return { error: "Counted quantity must be a non-negative number." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const quant = await tx.stockQuant.findUnique({
        where: {
          productId_locationId: { productId, locationId },
        },
        include: { product: true, location: true },
      });

      const currentQty = quant ? quant.quantity : 0;
      const difference = countedQty - currentQty;

      if (difference === 0) {
        return { info: "Count matches system quantity exactly. No ledger adjustment needed." };
      }

      if (quant) {
        await tx.stockQuant.update({
          where: { id: quant.id },
          data: { quantity: countedQty },
        });
      } else {
        await tx.stockQuant.create({
          data: { productId, locationId, quantity: countedQty },
        });
      }

      // Log into Stock Ledger (StockMove)
      await tx.stockMove.create({
        data: {
          productId,
          fromLocationId: difference < 0 ? locationId : null,
          toLocationId: difference > 0 ? locationId : null,
          quantity: Math.abs(difference),
          documentType: "Adjustment",
          status: "Done",
          reference: `ADJ-${difference > 0 ? "+" : ""}${difference} (${reason})`,
          partner: "Inventory Auditor",
        },
      });

      return { difference, countedQty };
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/stock");
    revalidatePath("/dashboard/adjustments");
    revalidatePath("/dashboard/history");
    return { success: true, result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record stock adjustment.";
    return { error: message };
  }
}

export async function cancelMove(
  moveId: string,
  returnPath: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const move = await prisma.stockMove.findUnique({ where: { id: moveId } });
    if (!move) return { error: "Operation not found." };
    if (move.status === "Done") {
      return { error: "Completed operations cannot be canceled." };
    }

    await prisma.stockMove.update({
      where: { id: moveId },
      data: { status: "Canceled" },
    });

    revalidatePath("/dashboard");
    revalidatePath(returnPath);
    revalidatePath("/dashboard/history");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cancel move.";
    return { error: message };
  }
}
