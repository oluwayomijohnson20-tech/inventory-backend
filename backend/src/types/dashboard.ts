// KPI Types
export interface KPIValue {
  current: number;
  previous: number;
  percentageChange: number;
}

export interface KPIs {
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

// Chart Data
export interface CategoryStock {
  category: string;
  quantity: number;
}

export interface MovementTrendPoint {
  date: string;
  in: number;
  out: number;
  net: number;
}

// Table Data
export interface LowStockItem {
  productId: string;
  name: string;
  sku: string;
  currentQty: number;
  reorderPoint: number;
  qtyBelow: number;
  supplierName: string;
}

export interface RecentMovement {
  movementId: string;
  timestamp: string;
  productName: string;
  movementType: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER' | 'DAMAGE' | 'RETURN';
  quantity: number;
  userName: string;
  notes?: string;
}

// Dashboard Summary (response from API)
export interface DashboardSummary {
  kpis: KPIs;
  stockByCategory: CategoryStock[];
  stockMovementTrend: MovementTrendPoint[];
  lowStockItems: LowStockItem[];
  recentMovements: RecentMovement[];
}
