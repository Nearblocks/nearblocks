/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import Close from '../Icons/Close';
import { CampaignData } from '@/utils/types';

interface Props {
  onToggleAdd: () => void;
  isOpen: boolean;
  campaignData: CampaignData['data'];
}

const PreviewAd = ({ onToggleAdd, isOpen, campaignData }: Props) => {
  return (
    <DialogOverlay
      isOpen={isOpen}
      onDismiss={onToggleAdd}
      className="fixed bg-gray-600 bg-opacity-20 inset-0 z-30 flex items-center justify-center"
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
                      src={campaignData?.icon}
                      alt="Icon"
                      className="ad-icon inline"
                    />{' '}
                    <b className="text-black dark:text-neargray-10 ">
                      {campaignData?.site_name}
                    </b>
                    :{campaignData?.text}{' '}
                    <a
                      href={campaignData?.url}
                      target="_blank"
                      rel="nofollow"
                      className="font-bold text-[#3B82F6]"
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
