/* eslint-disable @next/next/no-img-element */
import { DialogContent, DialogOverlay } from '@reach/dialog';
import React from 'react';

import { CampaignData } from '@/utils/types';

import Close from '../Icons/Close';

interface Props {
  campaignData: CampaignData['data'];
  isOpen: boolean;
  onToggleAdd: () => void;
}

const PreviewAd = ({ campaignData, isOpen, onToggleAdd }: Props) => {
  return (
    <DialogOverlay
      className="fixed bg-gray-600 bg-opacity-20 inset-0 z-30 flex items-center justify-center"
      isOpen={isOpen}
      onDismiss={onToggleAdd}
    >
      <DialogContent
        aria-label="Preview Ad"
        className="w-full max-w-lg mx-auto bg-white dark:bg-black-600 dark:text-neargray-10 shadow-lg rounded-lg overflow-hidden"
      >
        <div className="flex items-center justify-between  px-6 pt-8">
          <h4 className="flex items-center text-sm break-all">
            Text Ad Preview
          </h4>
          <button
            className="text-gray-500 dark:text-neargray-10  fill-current"
            onClick={onToggleAdd}
          >
            <Close />
          </button>
        </div>
        <div className="px-6 pb-10 pt-2">
          <div className="py-2">
            <div className="text-white pt-3">
              <div className="relative">
                <div className="text-sm">
                  <p className="text-black dark:text-neargray-10 ">
                    <b>Sponsored: </b>{' '}
                    <img
                      alt="Icon"
                      className="ad-icon inline"
                      src={campaignData?.icon}
                    />{' '}
                    <b className="text-black dark:text-neargray-10 ">
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
      </DialogContent>
    </DialogOverlay>
  );
};

export default PreviewAd;
