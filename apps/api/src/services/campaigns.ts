import { Request, Response } from 'express';

import { Network } from 'nb-types';

import config from '#config';
import catchAsync from '#libs/async';
import logger from '#libs/logger';
import { userSql } from '#libs/postgres';
import { Campaign } from '#types/types';

const baseUrl =
  config.network === Network.MAINNET ? config.mainnetUrl : config.testnetUrl;

const getApprovedAds = catchAsync(async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const query = userSql<Campaign[]>`
      SELECT
        c.*
      FROM
        campaign__ads c
        JOIN (
          SELECT
            CEIL(
              RANDOM() * (
                SELECT
                  MAX(id)
                FROM
                  campaign__ads
              )
            ) AS rand_id
        ) r ON c.id >= r.rand_id
      WHERE
        c.is_approved = TRUE
        AND c.is_active = TRUE
        AND c.api_subscription_id IN (
          SELECT
            id
          FROM
            api__subscriptions
          WHERE
            status = 'active'
        )
        AND c.text IS NULL
      ORDER BY
        c.id
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

    const impressionUrl = `${baseUrl}/v1/track/impression/${ad.id}`;
    const clickUrl = `${baseUrl}/v1/track/click/${ad.id}`;

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
  } catch (error) {
    logger.error(error);
    return null;
  }
});

const getApprovedTextAds = catchAsync(async (_req: Request, res: Response) => {
  try {
    const query = userSql<Campaign[]>`
      SELECT
        c.*
      FROM
        campaign__ads c
        JOIN (
          SELECT
            CEIL(
              RANDOM() * (
                SELECT
                  MAX(id)
                FROM
                  campaign__ads
              )
            ) AS rand_id
        ) r ON c.id >= r.rand_id
      WHERE
        c.is_approved = TRUE
        AND c.is_active = TRUE
        AND c.api_subscription_id IN (
          SELECT
            id
          FROM
            api__subscriptions
          WHERE
            status = 'active'
        )
        AND c.text IS NOT NULL
      ORDER BY
        c.id
      LIMIT
        1;
    `;

    const result = await query;
    const ad = result[0];

    if (!ad) {
      return res.status(204).send();
    }

    const clickUrl = `${baseUrl}/v1/track/click/${ad.id}`;
    const impressionUrl = `${baseUrl}/v1/track/impression/${ad.id}`;
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
  } catch (error) {
    logger.error(error);
    return null;
  }
});

const trackImpression = catchAsync(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  try {
    const now = new Date();

    await userSql`
      INSERT INTO
        campaign_ad_tracking_datas (
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
        impressions = campaign_ad_tracking_datas.impressions + 1
    `;

    const transparentPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAUA\n' +
        'AAAFCAYAAACNbyblAAAAHElEQVR42mJ8/5+hAQQw4f3QXAANuA4HM+DQAAAABJRU5ErkJggg==',
      'base64',
    );

    res.set('Content-Type', 'image/png');
    return res.status(200).send(transparentPixel);
  } catch (error) {
    logger.error(error);
    return null;
  }
});

const trackClick = catchAsync(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  try {
    const now = new Date();

    await userSql`
      INSERT INTO
        campaign_ad_tracking_datas (
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
        clicks = campaign_ad_tracking_datas.clicks + 1
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
  } catch (error) {
    logger.error(error);
    return null;
  }
});

export default {
  getApprovedAds,
  getApprovedTextAds,
  trackClick,
  trackImpression,
};
