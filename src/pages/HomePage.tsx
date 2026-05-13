import {
  VerticalSpace,
  Container,
  IconArc24,
  IconLayoutAlignLeft24,
  IconLayoutAlignBottom24,
  IconLine24,
  IconSettings24,
  IconVariableColor24,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import List from "../components/List";
interface HomePageProps {
  onNavigate: (
    page:
      | "pieDonutChart"
      | "horizontalBar"
      | "verticalBar"
      | "util"
      | "designSystemConfig",
  ) => void;
}
function HomePage({ onNavigate }: HomePageProps) {
  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      <h2>Chart builder</h2>
      <VerticalSpace space="medium" />
      <div>
        <List
          icon={<IconArc24 />}
          title="Pie & Donut charts"
          onClick={() => onNavigate("pieDonutChart")}
        />
        <List
          icon={<IconLayoutAlignLeft24 />}
          title="Horizontal bar chart"
          onClick={() => onNavigate("horizontalBar")}
        />
        <List
          icon={<IconLayoutAlignBottom24 />}
          title="Vertical bar chart"
          onClick={() => onNavigate("verticalBar")}
        />
        <List
          icon={<IconVariableColor24 />}
          title="Design system config"
          onClick={() => onNavigate("designSystemConfig")}
        />
        <List
          icon={<IconSettings24 />}
          title="Util page"
          onClick={() => onNavigate("util")}
        />
      </div>
    </Container>
  );
}
export default HomePage;
