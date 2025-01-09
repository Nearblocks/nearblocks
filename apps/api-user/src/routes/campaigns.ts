import { Router } from 'express';

import campaigns from '#services/campaigns';

const route = Router();

const routes = (app: Router) => {
  app.use('/', route);

  route.get('/campaigns', campaigns.getApprovedAds);

  route.get('/campaigns/text-ads', campaigns.getApprovedTextAds);

  route.get(
    '/campaigns/track/impression/:campaignId',
    campaigns.trackImpression,
  );

  route.get('/campaigns/track/click/:campaignId', campaigns.trackClick);
};

export default routes;
