import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { DashboardService } from '../services/dashboardService';

export function createDashboardRouter(pool: Pool): Router {
  const router = Router();
  const dashboardService = new DashboardService(pool);

  // Middleware to mock authentication/authorization
  const mockAuthMiddleware = (req: Request, res: Response, next: Function) => {
    // Mock org and user from request
    req.orgId = req.params.orgId || '550e8400-e29b-41d4-a716-446655440000';
    req.userId = 'mock-user-id';
    next();
  };

  router.use(mockAuthMiddleware);

  /**
   * GET /api/v1/:orgId/locations/:locId/dashboard/summary
   * Get complete dashboard summary for a location
   */
  router.get('/:orgId/locations/:locId/dashboard/summary', async (req: Request, res: Response) => {
    try {
      const { orgId, locId } = req.params;

      // Validate UUIDs (basic check)
      if (!isValidUUID(orgId) || !isValidUUID(locId)) {
        return res.status(400).json({
          error: 'Invalid organization or location ID',
        });
      }

      // Verify location exists and belongs to org
      const locationCheck = await pool.query(
        'SELECT location_id FROM locations WHERE location_id = $1 AND organization_id = $2',
        [locId, orgId]
      );

      if (locationCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'Location not found',
        });
      }

      const summary = await dashboardService.getDashboardSummary(orgId, locId);

      res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Dashboard summary error:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard summary',
      });
    }
  });

  /**
   * GET /api/v1/:orgId/locations
   * Get all active locations for an organization
   */
  router.get('/:orgId/locations', async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;

      if (!isValidUUID(orgId)) {
        return res.status(400).json({
          error: 'Invalid organization ID',
        });
      }

      const result = await pool.query(
        `SELECT location_id, name FROM locations
         WHERE organization_id = $1 AND is_active = true
         ORDER BY name`,
        [orgId]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error('Locations fetch error:', error);
      res.status(500).json({
        error: 'Failed to fetch locations',
      });
    }
  });

  return router;
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
