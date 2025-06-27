interface Props {
  className?: string;
}
const Home = (props: Props) => {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 18 16"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M10.5 15.5H6.75V14H9V10.25H13.5V14H15V8.6165L11.2282 5.4515L5.4015 10.406L3.603 8.51525L1.5 10.1472V15.5L0 15.4992V9.5L3.74175 6.485L5.511 8.34575L11.2245 3.48725L16.5 7.92125V15.5H12V11.75H10.5V15.5ZM6 14.75V15.5H2.25V14.75H6ZM2.25 13.25H6V14H2.25V13.25ZM2.25 11.75H6V12.5H2.25V11.75ZM11.25 0.5L18 6.24125L16.9965 7.36175L11.2387 2.495L5.562 7.337L4.491 6.23825L11.25 0.5Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default Home;
