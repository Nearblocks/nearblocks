import { useRouter } from 'next/router';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import Overview from '@/components/skeleton/common/Overview';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Layout from '@/components/Layouts';
import { useAuthStore } from '@/stores/auth';

import { ReactElement, useEffect, useRef, useState } from 'react';

const Address = () => {
  const router = useRouter();
  const { id } = router.query;
  const components = useBosComponents();
  const { t } = useTranslation();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});

  const updateOuterDivHeight = () => {
    if (heightRef.current) {
      const Height = heightRef.current.offsetHeight;
      setHeight({ height: Height });
    } else {
      setHeight({});
    }
  };

  useEffect(() => {
    updateOuterDivHeight();
    window.addEventListener('resize', updateOuterDivHeight);

    return () => {
      window.removeEventListener('resize', updateOuterDivHeight);
    };
  }, []);

  const onChangeHeight = () => {
    setHeight({});
  };

  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );

  const signedIn = useAuthStore((store) => store.signedIn);
  const account = useAuthStore((store) => store.account);
  const logOut = useAuthStore((store) => store.logOut);

  return (
    <div style={height} className="relative container mx-auto px-3">
      <VmComponent
        skeleton={<Overview className="absolute pr-6" ref={heightRef} />}
        defaultSkelton={<Overview />}
        onChangeHeight={onChangeHeight}
        src={components?.account}
        props={{
          id: id,
          network: networkId,
          t: t,
          requestSignInWithWallet: requestSignInWithWallet,
          signedIn: signedIn,
          accountId:
            account && account?.loading === false ? account?.accountId : null,
          logOut: logOut,
        }}
      />
    </div>
  );
};

Address.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Address;
