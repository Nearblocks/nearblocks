/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { DialogCloseTrigger, DialogContent } from '@/components/ui/dialog';
import { CampaignData } from '@/utils/types';

interface Props {
  campaignData: CampaignData['data'];
}

const PreviewAd = ({ campaignData }: Props) => {
  return (
    <DialogContent
      aria-label="Preview Ad"
      className="w-full max-w-lg mx-2 bg-white dark:bg-black-600 dark:text-neargray-10 shadow-lg rounded-lg overflow-hidden"
    >
      <div className="flex items-center justify-between  px-6 pt-8">
        <h4 className="flex items-center text-sm break-all">Text Ad Preview</h4>
      </div>
      <div className="px-6 pb-10 pt-2">
        <div className="py-2">
          <div className="text-white pt-3">
            <div className="relative">
              <div className="text-sm">
                <p className="text-nearblue-600 dark:text-neargray-10 ">
                  <b>Sponsored: </b>{' '}
                  <img
                    alt="Icon"
                    className="ad-icon inline"
                    src={campaignData?.icon}
                  />{' '}
                  <b className="text-nearblue-600 dark:text-neargray-10 ">
                    {campaignData?.site_name}
                  </b>
                  :{campaignData?.text}{' '}
                  <a
                    className="font-bold text-[#3B82F6]"
                    href={campaignData?.url}
                    rel="nofollow"
                    target="_blank"
                  >
                    {campaignData?.link_name}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DialogCloseTrigger className="text-gray-500 fill-current" />
    </DialogContent>
  );
};

export default PreviewAd;
