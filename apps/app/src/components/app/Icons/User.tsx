interface Props {
  className?: string;
}

const User = (props: Props) => {
  return (
    <svg
      fill="none"
      height="16"
      stroke="currentColor"
      strokeWidth="0"
      viewBox="0 0 18 16"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18.0001 2H12.7501V3.5H18.0001V2ZM18.0001 5H12.7501V6.5H18.0001V5ZM18.0001 8H12.7501V9.5H18.0001V8ZM15.0001 14.8947V15.5H13.5001V14.762C13.5001 13.7652 13.5639 13.4772 12.5941 13.2522C10.7349 12.8232 8.9776 12.4182 8.3086 10.952C8.05885 10.406 7.8916 9.51125 8.5081 8.34725C9.7426 6.0155 10.0644 4.03775 9.39235 2.921C8.90935 2.11925 8.00035 2 7.5001 2C6.9961 2 6.0781 2.12225 5.5906 2.9405C4.9156 4.07375 5.2426 6.0395 6.4861 8.33375C7.11535 9.494 6.9526 10.3917 6.7051 10.9407C6.03985 12.4152 4.2166 12.8352 2.4526 13.2417C1.4416 13.4735 1.5001 13.748 1.5001 14.75V15.5H0.00310185L0.000101854 14.8752C-0.00664815 13.2072 0.0661019 12.254 1.98535 11.8107C4.0891 11.3255 6.1651 10.8905 5.16685 9.04925C2.2096 3.593 4.3246 0.5 7.5001 0.5C10.6156 0.5 12.7816 3.47825 9.83335 9.0485C8.86435 10.8785 10.8646 11.3135 13.0149 11.81C14.9416 12.2555 15.0076 13.2147 15.0001 14.8947Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default User;
