import { VmComponent } from "@/components/vm/VmComponent";
import { useBosComponents } from "@/hooks/useBosComponents";

const HomePage = () => {
  const components = useBosComponents();

  return <VmComponent src={components?.nodeExplorer} />;
};

export default HomePage;
