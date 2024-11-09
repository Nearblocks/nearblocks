const conf = {
  default: {
    style: {
      thumbnailBg: '#171717',
    }
  },
  near: {
    style: {
      thumbnailBg: '#033F40',
    },
  },
};

export const config = (brand) => {
  return conf[brand] || conf.default;
};
