import { Divider, Stack, Text, VerticalSpace } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import NavTab from "../components/navTab/NavTab";
import { TokenKeyLookupPanel } from "../components/TokenKeyLookupPanel";
import { ColorTokenChip } from "../components/ColorChips/ColorTokenChip";
import { NumChip } from "../components/NumChips/NumChip";
import { NumberTokenChip } from "../components/NumChips/NumberTokenChip";
import { TypographyTokenChip } from "../components/TypographyChips/TypographyTokenChip";
import {
  chartTitleConfig,
  ds,
  pluginUISize,
  verticalBarChartConfig,
} from "../config";
import type { ColorToken, NumberToken } from "../types";
import uiStyles from "../ui.css";
import { collectTypographyTokenPaths } from "../utils/chartTypography";
import { isNumberToken } from "../utils/numberTokenDisplay";

function ConfigMetricChip(props: { value: unknown }) {
  if (isNumberToken(props.value)) {
    return <NumberTokenChip token={props.value} />;
  }
  return <NumChip value={props.value as number} />;
}

interface DesignSystemConfigPageProps {
  onBack: () => void;
}

type DesignSystemTabId =
  | "general"
  | "legend"
  | "semiDonut"
  | "pieDonut"
  | "verticalBar"
  | "util";

/** Plugin UI dimensions while Design system page is open. */
const DESIGN_SYSTEM_WINDOW = { width: 490, height: 490 } as const;

const DESIGN_SYSTEM_TABS: ReadonlyArray<{
  id: DesignSystemTabId;
  label: string;
}> = [
  { id: "general", label: "General" },
  { id: "legend", label: "Legend" },
  { id: "semiDonut", label: "Semi-donut" },
  { id: "pieDonut", label: "Pie & donut" },
  { id: "verticalBar", label: "Vertical bar" },
  { id: "util", label: "Util" },
];

/** Strip section prefix from typography row paths for shorter labels. */
function typographyLabel(fullPath: string, sectionPrefix: string): string {
  if (fullPath === sectionPrefix) {
    return "typography";
  }
  const dotted = sectionPrefix.endsWith(".")
    ? sectionPrefix
    : `${sectionPrefix}.`;
  return fullPath.startsWith(dotted) ? fullPath.slice(dotted.length) : fullPath;
}

function semiDonutLayoutEntries(): Array<[string, string | number]> {
  const { totalValue: _, ...layout } = ds.chart.semiDonut;
  return Object.entries(layout);
}

function pieLayoutEntries(): Array<[string, string | number]> {
  const { indicator: _, ...layout } = ds.chart.pie;
  return Object.entries(layout);
}

function pieIndicatorMetricEntries(): Array<[string, unknown]> {
  const { typography: _, ...metrics } = ds.chart.pie.indicator;
  return Object.entries(metrics);
}

const vbColor = verticalBarChartConfig.color;

function TypographyBlock(props: { pathPrefix: string; root: unknown }) {
  const { pathPrefix, root } = props;
  return (
    <div className={uiStyles.typographyTokenList}>
      {collectTypographyTokenPaths(pathPrefix, root).map(function ({
        path,
        token,
      }) {
        const labelPath = typographyLabel(path, pathPrefix);
        return (
          <div key={path} className={uiStyles.typographyTokenRow}>
            <span className={uiStyles.fieldLabel}>{labelPath}</span>
            <TypographyTokenChip token={token} />
          </div>
        );
      })}
    </div>
  );
}

function DesignSystemConfigPage({ onBack }: DesignSystemConfigPageProps) {
  const [activeTab, setActiveTab] = useState<DesignSystemTabId>("general");

  useEffect(function () {
    emit("RESIZE_PLUGIN_UI_WINDOW", {
      width: DESIGN_SYSTEM_WINDOW.width,
      height: DESIGN_SYSTEM_WINDOW.height,
    });
    return function () {
      emit("RESIZE_PLUGIN_UI_WINDOW", {
        width: pluginUISize.homePage.width,
        height: pluginUISize.homePage.height,
      });
    };
  }, []);

  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        height: DESIGN_SYSTEM_WINDOW.height,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid var(--figma-color-border)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          gap: 8,
          padding: "10px",
          width: 148,
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexShrink: 0,
            gap: 4,
          }}
        >
          <button
            type="button"
            className={uiStyles.navBackButton}
            onClick={onBack}
            title="Back"
          >
            ←
          </button>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Text className={uiStyles.navTitle}>Design system</Text>
          </div>
        </div>
        <div
          style={{
            alignItems: "stretch",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            justifyContent: "stretch",
            width: "100%",
          }}
        >
          {DESIGN_SYSTEM_TABS.map(function (tab) {
            return (
              <NavTab
                key={tab.id}
                selected={activeTab === tab.id}
                onSelect={function () {
                  setActiveTab(tab.id);
                }}
              >
                {tab.label}
              </NavTab>
            );
          })}
        </div>
      </aside>
      <main
        style={{
          boxSizing: "border-box",
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
          padding: "10px 12px 12px",
        }}
      >
        {activeTab === "general" ? (
          <div>
            <Text className={uiStyles.sectionTitle}>Chart colors</Text>
            <VerticalSpace space="medium" />
            <div className={uiStyles.colorGrid}>
              {ds.colors.dataVis.general.map(function (token, index) {
                return (
                  <div key={index} className={uiStyles.colorColumn}>
                    <div className={uiStyles.variableKey}>{`${index + 1}`}</div>
                    <ColorTokenChip token={token as ColorToken} />
                  </div>
                );
              })}
            </div>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />
            <Stack space="medium">
              <Text className={uiStyles.sectionTitle}>Text colors</Text>
              <Stack space="small">
                {Object.entries(ds.colors.text).map(function ([role, token]) {
                  return (
                    <div key={role} className={uiStyles.colorTokenRow}>
                      <div className={uiStyles.variableKey}>{role}</div>
                      <ColorTokenChip token={token as ColorToken} />
                    </div>
                  );
                })}
              </Stack>
              <Divider />
            </Stack>
            <VerticalSpace space="medium" />
            <Text className={uiStyles.sectionTitle}>Canvas background</Text>
            <VerticalSpace space="small" />
            <div className={uiStyles.colorTokenRow}>
              <div className={uiStyles.variableKey}>colors.background</div>
              <ColorTokenChip token={ds.colors.background} />
            </div>
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>Chart title</Text>
            <VerticalSpace space="small" />
            <div className={uiStyles.configValueList}>
              <div className={uiStyles.configValueRow}>
                <span className={uiStyles.fieldLabel}>padding.horizontal</span>
                <NumberTokenChip
                  token={chartTitleConfig.padding.horizontal as NumberToken}
                />
              </div>
              <div className={uiStyles.configValueRow}>
                <span className={uiStyles.fieldLabel}>padding.vertical</span>
                <NumberTokenChip
                  token={chartTitleConfig.padding.vertical as NumberToken}
                />
              </div>
            </div>
            <VerticalSpace space="small" />
            <TypographyBlock
              pathPrefix="chartTitle.typography"
              root={chartTitleConfig.typography}
            />
          </div>
        ) : null}

        {activeTab === "legend" ? (
          <div>
            <Text className={uiStyles.sectionTitle}>Legend</Text>
            <VerticalSpace space="small" />
            <Text className={uiStyles.sectionTitle}>Spacing</Text>
            <VerticalSpace space="small" />
            <div className={uiStyles.configValueList}>
              {Object.entries(ds.legend.spacing).map(function ([key, token]) {
                return (
                  <div key={key} className={uiStyles.configValueRow}>
                    <span className={uiStyles.fieldLabel}>{key}</span>
                    <NumberTokenChip token={token as NumberToken} />
                  </div>
                );
              })}
            </div>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>Typography</Text>
            <VerticalSpace space="small" />
            <TypographyBlock
              pathPrefix="legend.typography"
              root={ds.legend.typography}
            />
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>Divider</Text>
            <VerticalSpace space="medium" />
            <div className={uiStyles.configValueList}>
              {Object.entries(ds.legend.color).map(function ([role, token]) {
                return (
                  <div key={role} className={uiStyles.colorTokenRow}>
                    <div className={uiStyles.variableKey}>{role}</div>
                    <ColorTokenChip token={token as ColorToken} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {activeTab === "semiDonut" ? (
          <div>
            <Text className={uiStyles.sectionTitle}>Layout</Text>
            <VerticalSpace space="small" />
            <div className={uiStyles.configValueList}>
              {semiDonutLayoutEntries().map(function ([key, value]) {
                return (
                  <div key={key} className={uiStyles.configValueRow}>
                    <span className={uiStyles.fieldLabel}>{key}</span>
                    <NumChip value={value} />
                  </div>
                );
              })}
            </div>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>Total value</Text>
            <VerticalSpace space="small" />
            <TypographyBlock
              pathPrefix="chart.semiDonut.totalValue.typography"
              root={ds.chart.semiDonut.totalValue.typography}
            />
          </div>
        ) : null}

        {activeTab === "pieDonut" ? (
          <div>
            <Text className={uiStyles.sectionTitle}>Layout</Text>
            <VerticalSpace space="small" />
            <div className={uiStyles.configValueList}>
              {pieLayoutEntries().map(function ([key, value]) {
                return (
                  <div key={key} className={uiStyles.configValueRow}>
                    <span className={uiStyles.fieldLabel}>{key}</span>
                    <NumChip value={value} />
                  </div>
                );
              })}
            </div>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>Indicator</Text>
            <VerticalSpace space="small" />
            <div className={uiStyles.configValueList}>
              {pieIndicatorMetricEntries().map(function ([key, value]) {
                return (
                  <div key={key} className={uiStyles.configValueRow}>
                    <span className={uiStyles.fieldLabel}>{key}</span>
                    <ConfigMetricChip value={value} />
                  </div>
                );
              })}
            </div>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />
            <Text className={uiStyles.sectionTitle}>
              Indicator · typography
            </Text>
            <VerticalSpace space="small" />
            <TypographyBlock
              pathPrefix="chart.pie.indicator.typography"
              root={ds.chart.pie.indicator.typography}
            />
          </div>
        ) : null}

        {activeTab === "verticalBar" ? (
          <div>
            <Text className={uiStyles.sectionTitle}>Axis & grid</Text>
            <VerticalSpace space="small" />
            <Stack space="small">
              {(
                [
                  ["axisLine", vbColor.axisLine],
                  ["gridLine", vbColor.gridLine],
                ] as const
              ).map(function ([role, token]) {
                return (
                  <div key={role} className={uiStyles.colorColumn}>
                    <div className={uiStyles.variableKey}>{role}</div>
                    <ColorTokenChip token={token as ColorToken} />
                  </div>
                );
              })}
            </Stack>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>Selected state</Text>
            <VerticalSpace space="small" />
            <Stack space="small">
              <div className={uiStyles.colorColumn}>
                <div className={uiStyles.variableKey}>labelBg</div>
                <ColorTokenChip token={vbColor.selected.labelBg} />
              </div>
              <div className={uiStyles.colorColumn}>
                <div className={uiStyles.variableKey}>highlightBg</div>
                <ColorTokenChip
                  token={vbColor.selected.highlightBg}
                  fallbackOpacity={0.08}
                />
              </div>
            </Stack>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>
              Axis titles & labels · typography
            </Text>
            <VerticalSpace space="small" />
            <TypographyBlock
              pathPrefix="verticalBar.color.typography"
              root={vbColor.typography}
            />
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>
              Y-axis tick labels · typography
            </Text>
            <VerticalSpace space="small" />
            <TypographyBlock
              pathPrefix="verticalBar.color.yAxisLabel"
              root={vbColor.yAxisLabel}
            />
          </div>
        ) : null}

        {activeTab === "util" ? <TokenKeyLookupPanel /> : null}
      </main>
    </div>
  );
}

export default DesignSystemConfigPage;
