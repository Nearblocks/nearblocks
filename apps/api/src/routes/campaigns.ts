import { Router } from 'express';

import campaigns from '#services/campaigns';

const route = Router();

const routes = (app: Router) => {
  app.use('/', route);

  /**
   * GET /v1/approved-campaigns
   * @return 200 - success response
   */
  route.get('/campaigns', campaigns.getApprovedAds);

  /**
   * GET /v1/approved-campaigns/text-ads
   * @return 200 - success response
   */
  route.get('/campaigns/text-ads', campaigns.getApprovedTextAds);

  /**
   * GET /v1/track/impression/:campaignId
   * @return 200 - success response
   */
  route.get('/campaigns/track/impression/:campaignId', campaigns.trackImpression);

  /**
   * GET /v1/track/click/:campaignId
   * @return 200 - success response
   */
  route.get('/campaigns/track/click/:campaignId', campaigns.trackClick);
};

export default routes;
