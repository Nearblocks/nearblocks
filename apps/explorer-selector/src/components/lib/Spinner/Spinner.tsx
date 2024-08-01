export function Spinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-12 h-12 border-[5px] border-solid border-black border-b-transparent rounded-[50%] inline-block box-border animate-spin duration-1000 linear infinite"></div>
    </div>
  );
}
