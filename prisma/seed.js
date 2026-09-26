const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: { sku: "ST-001" },
    data: { costPrice: 45.0, minStock: 20, reorderQty: 100 }
  });
  await prisma.product.updateMany({
    where: { sku: "CH-100" },
    data: { costPrice: 1200.0, minStock: 15, reorderQty: 30 }
  });
  await prisma.product.updateMany({
    where: { sku: "SC-500" },
    data: { costPrice: 150.0, minStock: 10, reorderQty: 50 }
  });

  await prisma.location.updateMany({
    where: { name: "Main Warehouse" },
    data: { shortCode: "WH-MAIN", address: "Plot 14, Central Logistics Park", isWarehouse: true }
  });
  await prisma.location.updateMany({
    where: { name: "Production Floor" },
    data: { shortCode: "PROD-A", address: "Building 2, Assembly Floor", isWarehouse: false }
  });

  await prisma.user.upsert({
    where: { email: "admin@stocksense.com" },
    update: {},
    create: {
      email: "admin@stocksense.com",
      name: "Alex Morgan",
      password: "adminpassword",
      role: "MANAGER"
    }
  });

  await prisma.location.upsert({
    where: { id: "rack-b-loc" },
    update: {},
    create: {
      id: "rack-b-loc",
      name: "Rack B (Shelving)",
      shortCode: "RACK-B",
      address: "Aisle 3, Tier 2",
      isWarehouse: false
    }
  });

  // Check if any adjustments exist, if not create a sample one from the PS example:
  // "Step 4 : Adjust damaged items: 3 kg steel damaged -> Stock: -3. Everything logged in the Stock Ledger."
  const adjCount = await prisma.stockMove.count({ where: { documentType: "Adjustment" } });
  if (adjCount === 0) {
    const steel = await prisma.product.findUnique({ where: { sku: "ST-001" } });
    const mainWh = await prisma.location.findFirst({ where: { name: "Main Warehouse" } });
    if (steel && mainWh) {
      await prisma.stockMove.create({
        data: {
          productId: steel.id,
          fromLocationId: mainWh.id,
          quantity: 3,
          documentType: "Adjustment",
          status: "Done",
          reference: "ADJ-3 (3 kg steel damaged)",
          partner: "Quality Auditor",
        }
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
