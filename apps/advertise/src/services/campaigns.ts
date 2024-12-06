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

  const desktopUrl = config.awsPublicUrl + '/' + desktopImage;
  const mobileUrl = config.awsPublicUrl + '/' + ad.mobile_image;

  const impressionUrl = `${config.apiUrl}/v1/campaigns/track/impression/${ad.id}`;
  const clickUrl = `${config.apiUrl}/v1/campaigns/track/click/${ad.id}`;

  const adCode = `<a href="${clickUrl}" rel="nofollow">
                          <img class="ad-image rounded-lg" src="${desktopUrl}" alt="Advertisement">
                      </a>
                      <img src="${impressionUrl}" style="display:none">
                      <style>
                          @media (min-width: 501px) and (max-width: 1023px) {
                              .ad-image {
                                  content: url("${mobileUrl}");
                              }
                          }
                      </style>`;

  return res.header('Content-Type', 'text/html').send(adCode);
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

  const clickUrl = `${config.apiUrl}/v1/campaigns/track/click/${ad.id}`;
  const impressionUrl = `${config.apiUrl}/v1/campaigns/track/impression/${ad.id}`;
  let adCode = `<div class="ad-text-content" style="font-size: 14px;font-family: Manrope, sans-serif; text-align: left;">
                          <p><b>Sponsored: </b>
                          <img src="${impressionUrl}" style="display:none">`;

  if (ad.icon) {
    const iconUrl = config.awsPublicUrl + '/' + ad.icon;
    adCode += `<img src="${iconUrl}" alt="Icon" class="ad-icon" style="display: inline;"> `;
  }

  adCode += `&nbsp;<b>${ad.site_name}</b>: ${ad.text.replace(/\n/g, '<br>')} 
                   <a href="${clickUrl}" class="text-blue-500 dark:text-green-250 font-bold no-underline" target="_blank" rel="nofollow">${
                     ad.link_name
                   }</a>
                   </p></div>`;

  return res.header('Content-Type', 'text/html').send(adCode);
});

const trackImpression = catchAsync(async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  const now = new Date();

  await userSql`
    INSERT INTO
      campaign_ad_metrics (
        INTERVAL,
        campaign_ad_id,
        impressions,
        created_at,
        updated_at
      )
    VALUES
      (
        ${now},
        ${campaignId},
        1,
        ${now},
        ${now}
      )
    ON CONFLICT (campaign_ad_id, INTERVAL) DO
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
      campaign_ad_metrics (
        INTERVAL,
        campaign_ad_id,
        clicks,
        created_at,
        updated_at
      )
    VALUES
      (
        ${now},
        ${campaignId},
        1,
        ${now},
        ${now}
      )
    ON CONFLICT (campaign_ad_id, INTERVAL) DO
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
