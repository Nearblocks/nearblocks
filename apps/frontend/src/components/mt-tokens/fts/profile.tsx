'use client';

import { AccountLink } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';

type Props = {
  cid: string;
  tid: string;
};

export const MtFtProfile = ({ cid, tid }: Props) => {
  const { t } = useLocale('mts');

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('contract.profile.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-36">{t('token.contract')}</ListLeft>
            <ListRight>
              <AccountLink account={cid} textClassName="max-w-60" />
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-36">{t('token.tokenId')}</ListLeft>
            <ListRight>
              <span className="text-body-sm">{tid}</span>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-36">{t('token.standard')}</ListLeft>
            <ListRight>
              <span className="text-body-sm">{t('token.nep245')}</span>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
