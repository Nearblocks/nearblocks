export function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="loading-spinner-pulse-container">
        <div className="loading-pulse">
          <div />
          <div />
          <div />
        </div>
      </div>
    </div>
  );
}
