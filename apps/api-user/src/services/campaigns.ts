import { Request, Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import db from '#libs/db';
import { redisClient } from '#libs/redis';
import { Campaign } from '#types/types';

const getApprovedAds = catchAsync(async (_req: Request, res: Response) => {
  const cachedAd = await getCachedBannerAd();

  if (cachedAd) {
    const desktopImage = cachedAd.desktop_image_right;

    const adResponse = {
      desktopImage: `${config.awsUrl}/${desktopImage}`,
      id: cachedAd.id,
      mobileImage: `${config.awsUrl}/${cachedAd.mobile_image}`,
    };

    return res.json(adResponse);
  }

  const query = `
  SELECT *
  FROM campaign__ads
  WHERE is_approved = TRUE
    AND is_active = TRUE
    AND text IS NULL
    AND api_subscription_id IN (
      SELECT id FROM api__subscriptions WHERE status = 'active'
    )
`;
  const result = await db.query(query);

  if (result.rows.length === 0) {
    return res.status(204).send();
  }

  await cacheApprovedBannerAds(result.rows);

  const ad = result.rows[0];
  const desktopImage = ad.desktop_image_right;

  const adResponse = {
    desktopImage: `${config.awsUrl}/${desktopImage}`,
    id: ad.id,
    mobileImage: `${config.awsUrl}/${ad.mobile_image}`,
  };

  return res.json(adResponse);
});

const getApprovedTextAds = catchAsync(async (_req: Request, res: Response) => {
  const cachedAd = await getCachedTextAd();

  if (cachedAd) {
    const adResponse = {
      icon: cachedAd.icon ? `${config.awsUrl}/${cachedAd.icon}` : null,
      id: cachedAd.id,
      linkName: cachedAd.link_name,
      siteName: cachedAd.site_name,
      text: cachedAd.text,
    };

    return res.json(adResponse);
  }

  const query = `
  SELECT *
  FROM campaign__ads
  WHERE is_approved = TRUE
    AND is_active = TRUE
    AND text IS NOT NULL
    AND api_subscription_id IN (
      SELECT id FROM api__subscriptions WHERE status = 'active'
    )
`;
  const result = await db.query(query);

  if (result.rows.length === 0) {
    return res.status(204).send();
  }

  await cacheApprovedTextAds(result.rows);

  const ad = result.rows[0];

  const adResponse = {
    icon: ad.icon ? `${config.awsUrl}/${ad.icon}` : null,
    id: ad.id,
    linkName: ad.link_name,
    siteName: ad.site_name,
    text: ad.text,
  };

  return res.json(adResponse);
});

const trackImpression = catchAsync(async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  const now = new Date();

  const query = `
    INSERT INTO campaign__ad__statistics (time, campaign_ad_id, impressions)
    VALUES ($1, $2, 1)
    ON CONFLICT (campaign_ad_id, time) DO UPDATE
    SET impressions = campaign__ad__statistics.impressions + 1
  `;

  await db.query(query, [now, campaignId]);

  const transparentPixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAUA\n' +
      'AAAFCAYAAACNbyblAAAAHElEQVR42mJ8/5+hAQQw4f3QXAANuA4HM+DQAAAABJRU5ErkJggg==',
    'base64',
  );

  res.set('Content-Type', 'image/png');

  return res.status(200).send(transparentPixel);
});

const trackClick = catchAsync(async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  const now = new Date();

  await db.query(
    `
    INSERT INTO campaign__ad__statistics (time, campaign_ad_id, clicks)
    VALUES ($1, $2, 1)
    ON CONFLICT (campaign_ad_id, time)
    DO UPDATE SET clicks = campaign__ad__statistics.clicks + 1
    `,
    [now, campaignId],
  );

  const { rows: adResult } = await db.query(
    `
    SELECT url
    FROM campaign__ads
    WHERE id = $1
    `,
    [campaignId],
  );

  if (!adResult.length) {
    return res.status(404).json({ error: 'Ad not found.' });
  }
  const targetUrl = adResult[0].url;

  res.setHeader('Location', targetUrl);

  return res.status(302).send();
});

const cacheApprovedBannerAds = async (ads: Campaign[]) => {
  const redisKey = `banner_ads`;
  await redisClient.del(redisKey);
  const adsData = ads.map((ad) => JSON.stringify(ad));
  await redisClient.rpush(redisKey, ...adsData);
  await redisClient.expire(redisKey, 3600);
};

const getCachedBannerAd = async (): Promise<Campaign | null> => {
  const redisKey = `banner_ads`;
  const adsCount = await redisClient.llen(redisKey);

  if (adsCount === 0) return null;

  const randomIndex = Math.floor(Math.random() * adsCount);
  const adString = await redisClient.lindex(redisKey, randomIndex);

  return adString ? JSON.parse(adString) : null;
};

const cacheApprovedTextAds = async (ads: Campaign[]) => {
  const redisKey = `text_ads`;
  await redisClient.del(redisKey);
  const adsData = ads.map((ad) => JSON.stringify(ad));
  await redisClient.rpush(redisKey, ...adsData);
  await redisClient.expire(redisKey, 3600);
};

const getCachedTextAd = async (): Promise<Campaign | null> => {
  const redisKey = `text_ads`;
  const adsCount = await redisClient.llen(redisKey);

  if (adsCount === 0) return null;

  const randomIndex = Math.floor(Math.random() * adsCount);
  const adString = await redisClient.lindex(redisKey, randomIndex);

  return adString ? JSON.parse(adString) : null;
};

export default {
  getApprovedAds,
  getApprovedTextAds,
  trackClick,
  trackImpression,
};
