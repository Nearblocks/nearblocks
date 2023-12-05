import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';

const Blocks = () => {
  const components = useBosComponents();

  return (
    <>
      <div className="container mx-auto px-3">
        <section>
          <VmComponent src={components?.blocks} />
        </section>
      </div>
    </>
  );
};

export default Blocks;
