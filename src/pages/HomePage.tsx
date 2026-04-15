import {
  Button,
  Stack,
  VerticalSpace,
  Container,
  IconArc24,
  IconLayoutAlignLeft24,
  IconLine24,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import List from "../components/List";
interface HomePageProps {
  onNavigate: (page: "semiDonut" | "horizontalBar") => void;
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
          title="Semi-donut chart"
          onClick={() => onNavigate("semiDonut")}
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
          icon={<IconArc24 />}
          title="Pie chart (coming soon)"
          disable={true}
        />
      </div>
    </Container>
  );
}
export default HomePage;
