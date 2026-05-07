import { fetchSpamTokens } from '@/data/spam-tokens';
import { isSpamToken } from '@/lib/utils';
import { Alert, AlertDescription } from '@/ui/alert';

type Props = {
  after: string;
  before: string;
  cid: string;
  linkLabel: string;
};

export const SpamAlert = async ({ after, before, cid, linkLabel }: Props) => {
  const patterns = await fetchSpamTokens();
  if (!isSpamToken(cid, patterns)) return null;

  return (
    <Alert className="bg-amber-background mt-3 mb-0 border-0">
      <AlertDescription className="text-amber-foreground text-body-xs block">
        {before}
        <a
          className="font-bold underline"
          href="https://github.com/Nearblocks/spam-token-list"
          rel="noopener noreferrer"
          target="_blank"
        >
          {linkLabel}
        </a>
        {after}
      </AlertDescription>
    </Alert>
  );
};
