import { Pool } from 'pg';

// Types
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

export class DashboardService {
  constructor(private pool: Pool) {}

  async getDashboardSummary(orgId: string, locId: string): Promise<DashboardSummary> {
    const kpis = await this.getKPIs(orgId, locId);
    const stockByCategory = await this.getStockByCategory(orgId, locId);
    const stockMovementTrend = await this.getStockMovementTrend(orgId, locId);
    const lowStockItems = await this.getLowStockItems(orgId, locId);
    const recentMovements = await this.getRecentMovements(orgId, locId);

    return {
      kpis,
      stockByCategory,
      stockMovementTrend,
      lowStockItems,
      recentMovements,
    };
  }

  private async getKPIs(orgId: string, locId: string): Promise<KPIs> {
    // Current inventory value
    const valueResult = await this.pool.query(
      `SELECT
        SUM(p.unit_cost * i.quantity_on_hand)::NUMERIC as total_value
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       WHERE p.organization_id = $1 AND i.location_id = $2`,
      [orgId, locId]
    );
    const currentValue = parseFloat(valueResult.rows[0]?.total_value) || 0;

    // Previous week inventory value
    const prevValueResult = await this.pool.query(
      `SELECT
        SUM(p.unit_cost * i.quantity_on_hand)::NUMERIC as total_value
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       WHERE p.organization_id = $1 AND i.location_id = $2
       AND i.updated_at < NOW() - INTERVAL '7 days'
       LIMIT 1`,
      [orgId, locId]
    );
    const previousValue = parseFloat(prevValueResult.rows[0]?.total_value) || currentValue;
    const valueChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

    // Current total quantity
    const qtyResult = await this.pool.query(
      `SELECT
        SUM(i.quantity_on_hand)::INTEGER as total_qty
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       WHERE p.organization_id = $1 AND i.location_id = $2`,
      [orgId, locId]
    );
    const currentQty = qtyResult.rows[0]?.total_qty || 0;

    // Previous week quantity
    const prevQtyResult = await this.pool.query(
      `SELECT
        SUM(CASE
          WHEN sm.movement_type IN ('IN', 'TRANSFER') THEN -sm.quantity
          WHEN sm.movement_type IN ('OUT', 'DAMAGE') THEN sm.quantity
          ELSE 0
        END)::INTEGER as qty_adjusted
       FROM stock_movements sm
       WHERE sm.location_id = $1
       AND sm.created_at >= NOW() - INTERVAL '7 days'
       AND sm.product_id IN (SELECT product_id FROM products WHERE organization_id = $2)`,
      [locId, orgId]
    );
    const qtyAdjusted = prevQtyResult.rows[0]?.qty_adjusted || 0;
    const previousQty = currentQty + qtyAdjusted;
    const qtyChange = previousQty > 0 ? ((currentQty - previousQty) / previousQty) * 100 : 0;

    // Low stock count
    const lowStockResult = await this.pool.query(
      `SELECT COUNT(*) as count
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       WHERE p.organization_id = $1
       AND i.location_id = $2
       AND i.quantity_on_hand <= p.reorder_point`,
      [orgId, locId]
    );
    const lowStockCount = parseInt(lowStockResult.rows[0]?.count) || 0;

    // New low stock items this week
    const newLowStockResult = await this.pool.query(
      `SELECT COUNT(DISTINCT sm.product_id) as count
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.product_id
       WHERE p.organization_id = $1
       AND sm.location_id = $2
       AND sm.created_at >= NOW() - INTERVAL '7 days'
       AND sm.product_id IN (
         SELECT product_id FROM inventory
         WHERE location_id = $2
         AND quantity_on_hand <= (
           SELECT reorder_point FROM products
           WHERE product_id = inventory.product_id
         )
       )`,
      [orgId, locId]
    );
    const newLowStock = parseInt(newLowStockResult.rows[0]?.count) || 0;

    // Pending purchase orders
    const poResult = await this.pool.query(
      `SELECT
        COUNT(*) as count,
        COALESCE(SUM(total_value), 0)::NUMERIC as total_value
       FROM purchase_orders
       WHERE organization_id = $1
       AND location_id = $2
       AND status IN ('DRAFT', 'SUBMITTED')`,
      [orgId, locId]
    );
    const poCount = parseInt(poResult.rows[0]?.count) || 0;
    const poValue = parseFloat(poResult.rows[0]?.total_value) || 0;

    return {
      inventoryValue: {
        current: currentValue,
        previous: previousValue,
        percentageChange: parseFloat(valueChange.toFixed(1)),
      },
      totalQuantity: {
        current: currentQty,
        previous: previousQty,
        percentageChange: parseFloat(qtyChange.toFixed(1)),
      },
      lowStockCount: {
        current: lowStockCount,
        newThisWeek: newLowStock,
      },
      pendingPOs: {
        count: poCount,
        totalValue: parseFloat(poValue.toFixed(2)),
      },
    };
  }

  private async getStockByCategory(orgId: string, locId: string): Promise<CategoryStock[]> {
    const result = await this.pool.query(
      `SELECT
        c.name as category,
        SUM(i.quantity_on_hand)::INTEGER as quantity
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.organization_id = $1
       AND i.location_id = $2
       GROUP BY c.name
       ORDER BY quantity DESC`,
      [orgId, locId]
    );

    return result.rows.map((row) => ({
      category: row.category,
      quantity: row.quantity || 0,
    }));
  }

  private async getStockMovementTrend(orgId: string, locId: string): Promise<MovementTrendPoint[]> {
    const result = await this.pool.query(
      `SELECT
        DATE(created_at) as date,
        SUM(CASE WHEN movement_type IN ('IN', 'TRANSFER') THEN quantity ELSE 0 END)::INTEGER as in_qty,
        SUM(CASE WHEN movement_type IN ('OUT', 'DAMAGE') THEN quantity ELSE 0 END)::INTEGER as out_qty,
        SUM(CASE
          WHEN movement_type IN ('IN', 'TRANSFER') THEN quantity
          WHEN movement_type IN ('OUT', 'DAMAGE') THEN -quantity
          ELSE 0
        END)::INTEGER as net
       FROM stock_movements
       WHERE location_id = $1
       AND created_at >= NOW() - INTERVAL '30 days'
       AND product_id IN (SELECT product_id FROM products WHERE organization_id = $2)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [locId, orgId]
    );

    // Fill in missing dates with 0 values
    const allDates = this.generateDateRange(30);
    const movementMap = new Map(result.rows.map((row) => [row.date, row]));

    return allDates.map((date) => {
      const movement = movementMap.get(date);
      return {
        date,
        in: movement?.in_qty || 0,
        out: movement?.out_qty || 0,
        net: movement?.net || 0,
      };
    });
  }

  private async getLowStockItems(orgId: string, locId: string): Promise<LowStockItem[]> {
    const result = await this.pool.query(
      `SELECT
        p.product_id,
        p.name,
        p.sku,
        i.quantity_on_hand,
        p.reorder_point,
        (p.reorder_point - i.quantity_on_hand)::INTEGER as qty_below,
        COALESCE(s.name, 'N/A') as supplier_name
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
       WHERE p.organization_id = $1
       AND i.location_id = $2
       AND i.quantity_on_hand <= p.reorder_point
       ORDER BY qty_below DESC
       LIMIT 10`,
      [orgId, locId]
    );

    return result.rows.map((row) => ({
      productId: row.product_id,
      name: row.name,
      sku: row.sku,
      currentQty: row.quantity_on_hand,
      reorderPoint: row.reorder_point,
      qtyBelow: row.qty_below,
      supplierName: row.supplier_name,
    }));
  }

  private async getRecentMovements(orgId: string, locId: string): Promise<RecentMovement[]> {
    const result = await this.pool.query(
      `SELECT
        sm.movement_id,
        sm.created_at::TEXT as timestamp,
        p.name as product_name,
        sm.movement_type,
        sm.quantity,
        sm.user_name,
        sm.notes
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.product_id
       WHERE p.organization_id = $1
       AND sm.location_id = $2
       ORDER BY sm.created_at DESC
       LIMIT 20`,
      [orgId, locId]
    );

    return result.rows.map((row) => ({
      movementId: row.movement_id,
      timestamp: row.timestamp,
      productName: row.product_name,
      movementType: row.movement_type,
      quantity: row.quantity,
      userName: row.user_name,
      notes: row.notes,
    }));
  }

  private generateDateRange(days: number): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }
}
