const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Main Warehouse
  const mainWh = await prisma.location.create({
    data: { name: 'Main Warehouse', isWarehouse: true }
  });
  
  const prodFloor = await prisma.location.create({
    data: { name: 'Production Floor', isWarehouse: false }
  });

  // Create Products
  const p1 = await prisma.product.create({
    data: { name: 'Steel Rods', sku: 'ST-001', category: 'Raw Material', uom: 'kg', initialStock: 100 }
  });
  
  const p2 = await prisma.product.create({
    data: { name: 'Wooden Chairs', sku: 'CH-100', category: 'Finished Goods', uom: 'pcs', initialStock: 50 }
  });
  
  const p3 = await prisma.product.create({
    data: { name: 'Screws', sku: 'SC-500', category: 'Consumables', uom: 'box', initialStock: 5 } // Low stock
  });

  // Create Stock Quants (initial)
  await prisma.stockQuant.createMany({
    data: [
      { productId: p1.id, locationId: mainWh.id, quantity: 100 },
      { productId: p2.id, locationId: mainWh.id, quantity: 50 },
      { productId: p3.id, locationId: mainWh.id, quantity: 5 },
    ]
  });

  // Create some movements
  await prisma.stockMove.create({
    data: {
      productId: p1.id,
      toLocationId: mainWh.id,
      quantity: 50,
      documentType: 'Receipt',
      status: 'Done',
      reference: 'PO-001'
    }
  });

  await prisma.stockMove.create({
    data: {
      productId: p2.id,
      fromLocationId: mainWh.id,
      quantity: 10,
      documentType: 'Delivery',
      status: 'Ready',
      reference: 'SO-001'
    }
  });

  console.log('Seeded database!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
