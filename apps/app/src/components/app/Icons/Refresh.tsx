interface Props {
  className?: string;
}

const Refresh = (props: Props) => {
  return (
    <svg
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="9" cy="9" r="8.65" stroke="currentcolor" strokeWidth="0.7" />
      <g clipPath="url(#clip0_1201_3145)">
        <path
          d="M12.2991 9.46797L12.3017 9.44897V9.44964C12.3097 9.3903 12.3164 9.33064 12.3211 9.27064C12.3291 9.16997 12.2581 9.0003 12.0714 9.0003C11.9411 9.0003 11.8331 9.1003 11.8224 9.2303C11.8164 9.30397 11.8077 9.37697 11.7964 9.44897C11.5814 10.7993 10.4104 11.8333 8.99941 11.8333C7.98708 11.8333 7.09808 11.301 6.59741 10.5016L7.26108 10.5C7.39908 10.5 7.51108 10.388 7.51108 10.25C7.51108 10.112 7.39908 9.99997 7.26108 9.99997H5.91675C5.77875 9.99997 5.66675 10.112 5.66675 10.25V11.5996C5.66675 11.7376 5.77875 11.8496 5.91675 11.8496C6.05475 11.8496 6.16675 11.738 6.16675 11.5996L6.16775 10.758C6.75608 11.7033 7.80475 12.3333 8.99941 12.3333C10.6801 12.3333 12.0717 11.0863 12.2991 9.46797ZM5.70775 8.47664L5.70475 8.4953V8.49464C5.69308 8.5723 5.68375 8.65097 5.67741 8.73064C5.66941 8.8313 5.74041 9.00097 5.92708 9.00097C6.05741 9.00097 6.16541 8.90097 6.17608 8.77097C6.18341 8.67764 6.19541 8.58564 6.21175 8.4953C6.45041 7.17264 7.60808 6.16797 8.99908 6.16797C10.0114 6.16797 10.9004 6.7003 11.4011 7.49964L10.7374 7.5013C10.5994 7.5013 10.4874 7.6133 10.4874 7.7513C10.4874 7.8893 10.5994 8.0013 10.7374 8.0013H12.0817C12.2197 8.0013 12.3317 7.8893 12.3317 7.7513V6.40164C12.3317 6.26364 12.2197 6.15164 12.0817 6.15164C11.9437 6.15164 11.8317 6.2633 11.8317 6.40164L11.8307 7.2433C11.2424 6.29797 10.1937 5.66797 8.99908 5.66797C7.33775 5.66797 5.95908 6.88597 5.70775 8.47664Z"
          fill="currentcolor"
        />
      </g>
      <defs>
        <clipPath id="clip0_1201_3145">
          <rect fill="white" height="8" transform="translate(5 5)" width="8" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Refresh;
