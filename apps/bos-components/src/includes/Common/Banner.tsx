type Props = {
  type: string;
  userApiUrl: string;
};
type BannerProps = {
  clickUrl: string;
  desktopImageUrl: string;
  impressionUrl: string;
  mobileImageUrl: string;
};
export default function ({ type, userApiUrl }: Props) {
  const [htmlContent, setHtmlContent] = useState<BannerProps | null>(null);
  useEffect(() => {
    function fetchChartData() {
      asyncFetch(`${userApiUrl}approved-campaigns-json?type=${type}`)
        .then((res: { body: BannerProps; status: number }) => {
          if (res.status === 200) {
            if (res?.body) {
              setHtmlContent(res.body);
            }
          }
        })
        .catch((error: any) => {
          console.error('Error fetching HTML content:', error);
        });
    }
    if (userApiUrl) {
      fetchChartData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userApiUrl]);

  return htmlContent !== null && htmlContent?.clickUrl !== undefined ? (
    <div className="mx-auto w-full flex justify-center py-1">
      <div className="relative">
        <a
          href={htmlContent?.clickUrl}
          target="_blank"
          className="md:block hidden"
        >
          <img
            className="ad-image rounded-lg"
            src={htmlContent?.desktopImageUrl}
            alt="Advertisement"
          />
        </a>
        <a
          href={htmlContent?.clickUrl}
          target="_blank"
          className="md:hidden block"
        >
          <img
            className="ad-image rounded-lg"
            src={htmlContent?.mobileImageUrl}
            alt="Advertisement"
          />
        </a>
        <img
          src={htmlContent?.impressionUrl}
          className="hidden"
          alt="impressionUrl"
        />
        <div className="absolute border text-nearblue-600 dark:text-white dark:border dark:border-nearblue-650/[0.25] bg-white dark:bg-black-200 text-[8px] h-4 p-0.5 inline-flex items-center rounded-md -top-1.5 right-1.5 px-1">
          Ad
        </div>
      </div>
    </div>
  ) : (
    ''
  );
}
