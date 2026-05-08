import {
  VerticalSpace,
  Container,
  IconArc24,
  IconLayoutAlignLeft24,
  IconLine24,
  IconSettings24,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import List from "../components/List";
interface HomePageProps {
  onNavigate: (page: "horizontalBar" | "pieDonutChart" | "util") => void;
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
          icon={<IconLine24 />}
          title="Line chart (coming soon)"
          disable={true}
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
