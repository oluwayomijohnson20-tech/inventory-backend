import { Router, Request, Response } from 'express';
import { MockDashboardService } from '../services/mockDashboardService';

export function createMockDashboardRouter(): Router {
  const router = Router();
  const dashboardService = new MockDashboardService();

  /**
   * GET /api/v1/:orgId/locations/:locId/dashboard/summary
   * Get complete dashboard summary (mock data)
   */
  router.get('/:orgId/locations/:locId/dashboard/summary', async (req: Request, res: Response) => {
    try {
      const summary = await dashboardService.getDashboardSummary();

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
   * Get all locations (mock data)
   */
  router.get('/:orgId/locations', async (req: Request, res: Response) => {
    try {
      const locations = [
        { location_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Downtown Location' },
        { location_id: '550e8400-e29b-41d4-a716-446655440002', name: 'Uptown Location' },
        { location_id: '550e8400-e29b-41d4-a716-446655440003', name: 'Airport Location' },
      ];

      res.json({
        success: true,
        data: locations,
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
