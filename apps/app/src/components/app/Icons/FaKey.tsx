/**
 * @interface Props
 * @param {string} [className] - The CSS class name(s) for styling purposes.
 */

interface Props {
  className: string;
}
const FaKey = (props: Props) => {
  return (
    <svg
      className={props.className}
      fill="currentColor"
      height="1em"
      stroke="currentColor"
      strokeWidth="0"
      viewBox="0 0 512 512"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z"></path>
    </svg>
  );
};

export default FaKey;
