const conf = {
  default: {
    topLogo: '',
    bottomLogo: '',
    style: {
      thumbnailBg: '#171717',
    },
  },
  near: {
    topLogo: 'public/og-logo/top-logo/near.svg',
    bottomLogo: 'public/og-logo/bottom-logo/near.svg',
    style: {
      thumbnailBg: '#033F40',
    },
  },
};

export const config = (brand) => {
  return conf[brand] || conf.default;
};
