import { Container, Text, VerticalSpace } from "@create-figma-plugin/ui";
import { h } from "preact";
import ChartTypeIcon from "../components/ChartTypeIcon";
import List from "../components/List";
import styles from "./HomePage.module.css";

interface HomePageProps {
  onNavigate: (
    page:
      | "pieDonutChart"
      | "semiDonutChart"
      | "horizontalBar"
      | "verticalBar"
      | "lineChart"
      | "designSystemConfig",
  ) => void;
}

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <Container space="medium">
      <div className={styles.page}>
        <VerticalSpace space="small" />
        <Text className={styles.title}>Chart Builder</Text>
        <VerticalSpace space="small" />
        <Text className={styles.sectionTitle}>Charts</Text>
        <VerticalSpace space="small" />
        <div className={styles.listGroup}>
          <List
            preview={<ChartTypeIcon variant="pie" />}
            title="Pie & Donut"
            subtitle="Part-to-whole comparisons"
            onClick={() => onNavigate("pieDonutChart")}
          />
          <List
            preview={<ChartTypeIcon variant="semiDonut" />}
            title="Semi-donut"
            subtitle="Half-circle progress breakdown"
            onClick={() => onNavigate("semiDonutChart")}
          />
          <List
            preview={<ChartTypeIcon variant="verticalBar" />}
            title="Vertical bar"
            subtitle="Time series or grouped values"
            onClick={() => onNavigate("verticalBar")}
          />
          <List
            preview={<ChartTypeIcon variant="horizontalBar" />}
            title="Horizontal stack bar"
            subtitle="Stacked horizontal bar chart"
            onClick={() => onNavigate("horizontalBar")}
          />
          <List
            preview={<ChartTypeIcon variant="line" />}
            title="Line chart"
            subtitle="Trends over time or date ranges"
            onClick={() => onNavigate("lineChart")}
          />
        </div>

        <VerticalSpace space="medium" />

        <Text className={styles.sectionTitle}>Settings</Text>
        <VerticalSpace space="small" />
        <div className={styles.listGroup}>
          <List
            preview={<ChartTypeIcon variant="designSystem" />}
            title="Design system"
            subtitle="Colors, typography, spacing"
            variant="settings"
            onClick={() => onNavigate("designSystemConfig")}
          />
        </div>
      </div>
    </Container>
  );
}

export default HomePage;
