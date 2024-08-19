import React from 'react';
import useTranslation from 'next-translate/useTranslation';

const ContractInfo = ({ address, compilerType }: any) => {
  const { t } = useTranslation('contract');
  return (
    <>
      <div className="bg-gray-50 p-3 border dark:border-black-200 rounded">
        <div className="flex flex-wrap p-2">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('verify.compilerAddress')}
          </div>
          <div className="w-full md:w-3/4 font-semibold break-words">
            {address}
          </div>
        </div>
        <div className="flex flex-wrap p-2">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('verify.compilerType')}
          </div>
          <div className="w-full md:w-3/4 font-semibold break-words">
            {compilerType}
          </div>
        </div>
      </div>
    </>
  );
};
export default ContractInfo;
