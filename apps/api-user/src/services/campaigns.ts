import { Request, Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import { userSql } from '#libs/postgres';
import { Campaign } from '#types/types';

const getApprovedAds = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.query;
  const query = userSql<Campaign[]>`
    WITH
      valid_ads AS (
        SELECT
          *
        FROM
          campaign__ads
        WHERE
          is_approved = TRUE
          AND is_active = TRUE
          AND api_subscription_id IN (
            SELECT
              id
            FROM
              api__subscriptions
            WHERE
              status = 'active'
          )
          AND text IS NULL
      ),
      rand_selection AS (
        SELECT
          CEIL(
            RANDOM() * (
              SELECT
                MAX(id)
              FROM
                valid_ads
            )
          ) AS rand_id
      )
    SELECT
      *
    FROM
      valid_ads
    WHERE
      id >= (
        SELECT
          rand_id
        FROM
          rand_selection
      )
      OR id <= (
        SELECT
          rand_id
        FROM
          rand_selection
      )
    ORDER BY
      CASE
        WHEN id >= (
          SELECT
            rand_id
          FROM
            rand_selection
        ) THEN 1
        ELSE 2
      END,
      id
    LIMIT
      1;
  `;
  const result = await query;
  const ad = result[0];

  if (!ad) {
    return res.status(204).send();
  }

  const desktopImage =
    type === 'center' ? ad.mobile_image : ad.desktop_image_right;

  const adResponse = {
    desktopImage: `${config.awsUrl}/${desktopImage}`,
    id: ad.id,
    mobileImage: `${config.awsUrl}/${ad.mobile_image}`,
  };

  return res.json(adResponse);
});

const getApprovedTextAds = catchAsync(async (_req: Request, res: Response) => {
  const query = userSql<Campaign[]>`
    WITH
      valid_ads AS (
        SELECT
          *
        FROM
          campaign__ads
        WHERE
          is_approved = TRUE
          AND is_active = TRUE
          AND api_subscription_id IN (
            SELECT
              id
            FROM
              api__subscriptions
            WHERE
              status = 'active'
          )
          AND text IS NOT NULL
      ),
      rand_selection AS (
        SELECT
          CEIL(
            RANDOM() * (
              SELECT
                MAX(id)
              FROM
                valid_ads
            )
          ) AS rand_id
      )
    SELECT
      *
    FROM
      valid_ads
    WHERE
      id >= (
        SELECT
          rand_id
        FROM
          rand_selection
      )
      OR id <= (
        SELECT
          rand_id
        FROM
          rand_selection
      )
    ORDER BY
      CASE
        WHEN id >= (
          SELECT
            rand_id
          FROM
            rand_selection
        ) THEN 1
        ELSE 2
      END,
      id
    LIMIT
      1;
  `;
  const result = await query;
  const ad = result[0];

  if (!ad) {
    return res.status(204).send();
  }

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

  await userSql`
    INSERT INTO
      campaign_ad_metrics (TIME, campaign_ad_id, impressions)
    VALUES
      (
        ${now},
        ${campaignId},
        1
      )
    ON CONFLICT (campaign_ad_id, TIME) DO
    UPDATE
    SET
      impressions = campaign_ad_metrics.impressions + 1
  `;

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

  await userSql`
    INSERT INTO
      campaign_ad_metrics (TIME, campaign_ad_id, clicks)
    VALUES
      (
        ${now},
        ${campaignId},
        1
      )
    ON CONFLICT (campaign_ad_id, TIME) DO
    UPDATE
    SET
      clicks = campaign_ad_metrics.clicks + 1
  `;

  const adResult = await userSql`
    SELECT
      url
    FROM
      campaign__ads
    WHERE
      id = ${campaignId}
  `;

  if (!adResult.length) {
    return res.status(404).json({ error: 'Ad not found.' });
  }
  const targetUrl = adResult[0].url;

  res.setHeader('Location', targetUrl);
  return res.status(302).send();
});

export default {
  getApprovedAds,
  getApprovedTextAds,
  trackClick,
  trackImpression,
};
