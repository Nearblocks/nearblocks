/**
 * @interface Props
 * @param {string} [className] - The CSS class name(s) for styling purposes.
 */

interface Props {
  className: string;
}

const Clock = (props: Props) => (
  <svg
    aria-hidden="true"
    data-icon="clock-circle"
    fill="currentColor"
    focusable="false"
    height="1em"
    viewBox="64 64 896 896"
    width="1em"
    {...props}
  >
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
    <path d="M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z"></path>
  </svg>
);

export default Clock;
