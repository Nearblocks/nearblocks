'use client';

import { useLocale } from '@/hooks/use-locale';
import { MethodDoc } from '@/lib/contract';
import { Card, CardContent } from '@/ui/card';
import { Separator } from '@/ui/separator';

type Props = {
  doc: MethodDoc;
};

export const MethodDocs = ({ doc }: Props) => {
  const { t } = useLocale('address');

  return (
    <Card className="w-full lg:flex-1">
      <CardContent className="space-y-4 p-4">
        {doc.doc && (
          <p className="text-body-sm whitespace-pre-wrap text-muted-foreground">
            {doc.doc}
          </p>
        )}
        {doc.doc && <Separator />}
        <div>
          <p className="mb-2 text-body-xs font-medium text-muted-foreground">
            {t('contract.methods.parameters')}
          </p>
          {doc.params.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">
              {t('contract.methods.noParameters')}
            </p>
          ) : (
            <ul className="space-y-1">
              {doc.params.map((param) => (
                <li
                  className="flex items-baseline gap-2 font-mono text-body-sm"
                  key={param.name}
                >
                  <span>{param.name}</span>
                  <span className="text-muted-foreground">{param.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Separator />
        <div>
          <p className="mb-2 text-body-xs font-medium text-muted-foreground">
            {t('contract.methods.returns')}
          </p>
          <p className="font-mono text-body-sm">
            {doc.returns ?? t('contract.methods.noReturn')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
