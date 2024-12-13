export type Config = {
  apiUrl: string;
  awsUrl: string;
  dbUrl: string;
  port: number;
};

export type Campaign = {
  api_subscription_id: number;
  click_count: number;
  desktop_image_center: string;
  desktop_image_right: string;
  icon: string;
  id: number;
  impression_count: number;
  is_active: boolean;
  is_approved: boolean;
  link_name: string;
  mobile_image: string;
  site_name: string;
  start_date: string;
  text: string;
  title: string;
  url: string;
};
