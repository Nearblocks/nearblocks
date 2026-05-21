'use client';

import { AccountLink } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';

type Props = {
  cid: string;
  loading?: boolean;
};

export const Profile = ({ cid }: Props) => {
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
            <ListLeft className="min-w-28">
              {t('contract.profile.contract')}
            </ListLeft>
            <ListRight>
              <AccountLink account={cid} textClassName="max-w-60" />
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
