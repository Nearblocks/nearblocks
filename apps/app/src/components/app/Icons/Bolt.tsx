/**
 * @interface Props
 * @param {string} [className] - The CSS class name(s) for styling purposes.
 */

interface Props {
  className: string;
}

const Bolt = (props: Props) => {
  return (
    <svg
      fill="#033f40"
      height={16}
      stroke="#033f40"
      viewBox="0 0 56 56"
      width={16}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M 22.6211 53.2187 L 43.9023 25.8203 C 44.3008 25.3282 44.5117 24.8594 44.5117 24.3203 C 44.5117 23.4297 43.8320 22.7500 42.8477 22.7500 L 29.5820 22.7500 L 36.5899 4.5156 C 37.5039 2.1016 34.9492 .7891 33.4023 2.8047 L 12.1211 30.1797 C 11.6992 30.6953 11.4883 31.1641 11.4883 31.6797 C 11.4883 32.5938 12.1914 33.2734 13.1758 33.2734 L 26.4180 33.2734 L 19.4336 51.4844 C 18.4961 53.8984 21.0742 55.2109 22.6211 53.2187 Z M 31.8320 29.7813 L 17.3477 29.7813 L 30.5664 12.2266 L 24.1680 26.2422 L 38.6289 26.2422 L 25.4101 43.7969 Z"></path>
      </g>
    </svg>
  );
};

export default Bolt;
