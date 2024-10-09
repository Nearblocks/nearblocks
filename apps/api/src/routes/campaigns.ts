import { Router } from 'express';

import campaigns from '#services/campaigns';

const route = Router();

const routes = (app: Router) => {
  app.use('/', route);

  /**
   * @ignore
   * GET /v1/campaigns
   * @return 200 - success response
   */
  route.get('/campaigns', campaigns.getApprovedAds);

  /**
   * @ignore
   * GET /v1/campaigns/text-ads
   * @return 200 - success response
   */
  route.get('/campaigns/text-ads', campaigns.getApprovedTextAds);

  /**
   * @ignore
   * GET /v1/campaigns/track/impression/:campaignId
   * @return 200 - success response
   */
  route.get(
    '/campaigns/track/impression/:campaignId',
    campaigns.trackImpression,
  );

  /**
   * @ignore
   * GET /v1/campaigns/track/click/:campaignId
   * @return 200 - success response
   */
  route.get('/campaigns/track/click/:campaignId', campaigns.trackClick);
};

export default routes;
