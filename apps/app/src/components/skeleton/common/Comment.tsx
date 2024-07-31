import Skeleton from './Skeleton';
const Comment = () => {
  return (
    <>
      <div className="w-full mx-auto">
        <div className="p-4 md:px-8">
          <div className="md:flex justify-center w-full">
            <div className="w-full">
              <div className="py-2">
                <Skeleton className="w-full h-28" />{' '}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Comment;
