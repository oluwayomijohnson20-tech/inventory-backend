// Types defined locally
interface KPIValue {
  current: number;
  previous: number;
  percentageChange: number;
}

interface KPIs {
  inventoryValue: KPIValue;
  totalQuantity: KPIValue;
  lowStockCount: {
    current: number;
    newThisWeek: number;
  };
  pendingPOs: {
    count: number;
    totalValue: number;
  };
}

interface CategoryStock {
  category: string;
  quantity: number;
}

interface MovementTrendPoint {
  date: string;
  in: number;
  out: number;
  net: number;
}

interface LowStockItem {
  productId: string;
  name: string;
  sku: string;
  currentQty: number;
  reorderPoint: number;
  qtyBelow: number;
  supplierName: string;
}

interface RecentMovement {
  movementId: string;
  timestamp: string;
  productName: string;
  movementType: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER' | 'DAMAGE' | 'RETURN';
  quantity: number;
  userName: string;
  notes?: string;
}

interface DashboardSummary {
  kpis: KPIs;
  stockByCategory: CategoryStock[];
  stockMovementTrend: MovementTrendPoint[];
  lowStockItems: LowStockItem[];
  recentMovements: RecentMovement[];
}

// Mock data - no database needed!
export class MockDashboardService {
  async getDashboardSummary(): Promise<DashboardSummary> {
    return {
      kpis: {
        inventoryValue: {
          current: 125430.5,
          previous: 122500.0,
          percentageChange: 2.5,
        },
        totalQuantity: {
          current: 12847,
          previous: 12230,
          percentageChange: 5.1,
        },
        lowStockCount: {
          current: 23,
          newThisWeek: 2,
        },
        pendingPOs: {
          count: 7,
          totalValue: 45320.0,
        },
      },
      stockByCategory: [
        { category: 'Food', quantity: 4500 },
        { category: 'Beverages', quantity: 3200 },
        { category: 'Merchandise', quantity: 2800 },
        { category: 'Supplies', quantity: 2347 },
      ],
      stockMovementTrend: this.generateMovementTrend(),
      lowStockItems: [
        {
          productId: '1',
          name: 'Lettuce Head',
          sku: 'SKU002',
          currentQty: 15,
          reorderPoint: 50,
          qtyBelow: 35,
          supplierName: 'Fresh Foods Inc',
        },
        {
          productId: '2',
          name: 'Orange Juice',
          sku: 'SKU005',
          currentQty: 25,
          reorderPoint: 60,
          qtyBelow: 35,
          supplierName: 'Beverage Co',
        },
        {
          productId: '3',
          name: 'T-Shirt XL',
          sku: 'SKU006',
          currentQty: 8,
          reorderPoint: 30,
          qtyBelow: 22,
          supplierName: 'Supplies Ltd',
        },
        {
          productId: '4',
          name: 'Tomato Box',
          sku: 'SKU003',
          currentQty: 18,
          reorderPoint: 40,
          qtyBelow: 22,
          supplierName: 'Fresh Foods Inc',
        },
        {
          productId: '5',
          name: 'Burger Patties',
          sku: 'SKU001',
          currentQty: 45,
          reorderPoint: 100,
          qtyBelow: 55,
          supplierName: 'Fresh Foods Inc',
        },
        {
          productId: '6',
          name: 'Cola 2L',
          sku: 'SKU004',
          currentQty: 65,
          reorderPoint: 80,
          qtyBelow: 15,
          supplierName: 'Beverage Co',
        },
        {
          productId: '7',
          name: 'Plastic Cups',
          sku: 'SKU008',
          currentQty: 280,
          reorderPoint: 150,
          qtyBelow: 0,
          supplierName: 'Supplies Ltd',
        },
        {
          productId: '8',
          name: 'Napkins Pack',
          sku: 'SKU007',
          currentQty: 450,
          reorderPoint: 200,
          qtyBelow: 0,
          supplierName: 'Supplies Ltd',
        },
        {
          productId: '9',
          name: 'Coffee Beans',
          sku: 'SKU009',
          currentQty: 12,
          reorderPoint: 50,
          qtyBelow: 38,
          supplierName: 'Fresh Foods Inc',
        },
        {
          productId: '10',
          name: 'Milk Cartons',
          sku: 'SKU010',
          currentQty: 35,
          reorderPoint: 75,
          qtyBelow: 40,
          supplierName: 'Beverage Co',
        },
      ],
      recentMovements: [
        {
          movementId: '1',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          productName: 'Burger Patties',
          movementType: 'IN',
          quantity: 100,
          userName: 'John Manager',
          notes: 'Daily delivery',
        },
        {
          movementId: '2',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          productName: 'Lettuce Head',
          movementType: 'OUT',
          quantity: 35,
          userName: 'John Manager',
          notes: 'Daily sales',
        },
        {
          movementId: '3',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          productName: 'Cola 2L',
          movementType: 'IN',
          quantity: 80,
          userName: 'Sarah Staff',
          notes: 'Supplier delivery',
        },
        {
          movementId: '4',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          productName: 'Orange Juice',
          movementType: 'OUT',
          quantity: 25,
          userName: 'Sarah Staff',
          notes: 'Daily sales',
        },
        {
          movementId: '5',
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          productName: 'T-Shirt XL',
          movementType: 'DAMAGE',
          quantity: 5,
          userName: 'John Manager',
          notes: 'Damaged goods',
        },
        {
          movementId: '6',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          productName: 'Napkins Pack',
          movementType: 'OUT',
          quantity: 100,
          userName: 'Sarah Staff',
          notes: 'Daily usage',
        },
        {
          movementId: '7',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          productName: 'Plastic Cups',
          movementType: 'OUT',
          quantity: 150,
          userName: 'John Manager',
          notes: 'Daily usage',
        },
        {
          movementId: '8',
          timestamp: new Date(Date.now() - 4200000).toISOString(),
          productName: 'Tomato Box',
          movementType: 'IN',
          quantity: 50,
          userName: 'Sarah Staff',
          notes: 'Supplier delivery',
        },
        {
          movementId: '9',
          timestamp: new Date(Date.now() - 4800000).toISOString(),
          productName: 'Coffee Beans',
          movementType: 'IN',
          quantity: 40,
          userName: 'John Manager',
          notes: 'Wholesale order',
        },
        {
          movementId: '10',
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          productName: 'Milk Cartons',
          movementType: 'OUT',
          quantity: 20,
          userName: 'Sarah Staff',
          notes: 'Daily usage',
        },
        {
          movementId: '11',
          timestamp: new Date(Date.now() - 6000000).toISOString(),
          productName: 'Burger Patties',
          movementType: 'OUT',
          quantity: 50,
          userName: 'John Manager',
          notes: 'Daily sales',
        },
        {
          movementId: '12',
          timestamp: new Date(Date.now() - 6600000).toISOString(),
          productName: 'Orange Juice',
          movementType: 'IN',
          quantity: 60,
          userName: 'Sarah Staff',
          notes: 'Supplier delivery',
        },
        {
          movementId: '13',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          productName: 'Cola 2L',
          movementType: 'OUT',
          quantity: 45,
          userName: 'John Manager',
          notes: 'Daily sales',
        },
        {
          movementId: '14',
          timestamp: new Date(Date.now() - 7800000).toISOString(),
          productName: 'T-Shirt XL',
          movementType: 'OUT',
          quantity: 15,
          userName: 'Sarah Staff',
          notes: 'Retail sales',
        },
        {
          movementId: '15',
          timestamp: new Date(Date.now() - 8400000).toISOString(),
          productName: 'Lettuce Head',
          movementType: 'IN',
          quantity: 75,
          userName: 'John Manager',
          notes: 'Supplier delivery',
        },
        {
          movementId: '16',
          timestamp: new Date(Date.now() - 9000000).toISOString(),
          productName: 'Napkins Pack',
          movementType: 'ADJUST',
          quantity: 10,
          userName: 'Sarah Staff',
          notes: 'Inventory count adjustment',
        },
        {
          movementId: '17',
          timestamp: new Date(Date.now() - 9600000).toISOString(),
          productName: 'Tomato Box',
          movementType: 'OUT',
          quantity: 30,
          userName: 'John Manager',
          notes: 'Daily sales',
        },
        {
          movementId: '18',
          timestamp: new Date(Date.now() - 10200000).toISOString(),
          productName: 'Plastic Cups',
          movementType: 'IN',
          quantity: 200,
          userName: 'Sarah Staff',
          notes: 'Bulk order',
        },
        {
          movementId: '19',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          productName: 'Coffee Beans',
          movementType: 'OUT',
          quantity: 25,
          userName: 'John Manager',
          notes: 'Daily usage',
        },
        {
          movementId: '20',
          timestamp: new Date(Date.now() - 11400000).toISOString(),
          productName: 'Milk Cartons',
          movementType: 'IN',
          quantity: 80,
          userName: 'Sarah Staff',
          notes: 'Supplier delivery',
        },
      ],
    };
  }

  private generateMovementTrend() {
    const trend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      trend.push({
        date: dateStr,
        in: Math.floor(Math.random() * 500) + 200,
        out: Math.floor(Math.random() * 400) + 150,
        net: Math.floor(Math.random() * 300) - 150,
      });
    }
    return trend;
  }
}
