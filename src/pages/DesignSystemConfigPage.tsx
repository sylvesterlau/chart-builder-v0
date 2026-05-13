import { Divider, Text, VerticalSpace } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import NavTab from "../components/navTab/NavTab";
import { ds, pluginUISize } from "../config";
import uiStyles from "../ui.css";
import {
  collectTypographyTokenPaths,
  formatTypographyTokenAsCssFontShorthand,
} from "../utils/chartTypography";

interface DesignSystemConfigPageProps {
  onBack: () => void;
}

type DesignSystemTabId = "general" | "legend" | "semiDonut" | "pieDonut";

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
];

function hexDigits(hex: string): string {
  const trimmed = hex.trim().replace(/^#/, "");
  return trimmed.toUpperCase();
}

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

function pieIndicatorMetricEntries(): Array<[string, string | number]> {
  const { typography: _, ...metrics } = ds.chart.pie.indicator;
  return Object.entries(metrics);
}

function TypographyBlock(props: { pathPrefix: string; root: unknown }) {
  const { pathPrefix, root } = props;
  return (
    <div className={uiStyles.typographyTokenList}>
      {collectTypographyTokenPaths(pathPrefix, root).map(function ({
        path,
        token,
      }) {
        const fontLine = formatTypographyTokenAsCssFontShorthand(token);
        const labelPath = typographyLabel(path, pathPrefix);
        return (
          <div key={path} className={uiStyles.typographyTokenRow}>
            <span className={uiStyles.fieldLabel}>{labelPath}</span>
            <span className={uiStyles.typographyTokenValue} title={fontLine}>
              {fontLine}
            </span>
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
                    <div className={uiStyles.tokenName}>{`${index + 1}`}</div>
                    <div className={uiStyles.colorChip}>
                      <div
                        className={uiStyles.colorSwatch}
                        style={{ backgroundColor: token.value }}
                      />
                      <span className={uiStyles.colorHex}>
                        {hexDigits(token.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>Text colors</Text>
            <VerticalSpace space="small" />
            <div className={uiStyles.colorGrid}>
              {Object.entries(ds.colors.text).map(function ([role, token]) {
                return (
                  <div key={role} className={uiStyles.colorColumn}>
                    <div className={uiStyles.tokenName}>{role}</div>
                    <div className={uiStyles.colorChip}>
                      <div
                        className={uiStyles.colorSwatch}
                        style={{ backgroundColor: token.value }}
                      />
                      <span className={uiStyles.colorHex}>
                        {hexDigits(token.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="medium" />

            <Text className={uiStyles.sectionTitle}>
              Chart title · typography
            </Text>
            <VerticalSpace space="small" />
            <TypographyBlock
              pathPrefix="chartTitle.typography"
              root={ds.chartTitle.typography}
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
              {Object.entries(ds.legend.spacing).map(function ([key, value]) {
                return (
                  <div key={key} className={uiStyles.configValueRow}>
                    <span className={uiStyles.fieldLabel}>{key}</span>
                    <span className={uiStyles.colorHex}>{String(value)}</span>
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
            <div className={uiStyles.colorGrid}>
              {Object.entries(ds.legend.color).map(function ([role, token]) {
                return (
                  <div key={role} className={uiStyles.colorColumn}>
                    <div className={uiStyles.tokenName}>{role}</div>
                    <div className={uiStyles.colorChip}>
                      <div
                        className={uiStyles.colorSwatch}
                        style={{ backgroundColor: token.value }}
                      />
                      <span className={uiStyles.colorHex}>
                        {hexDigits(token.value)}
                      </span>
                    </div>
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
                    <span className={uiStyles.colorHex}>{String(value)}</span>
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
                    <span className={uiStyles.colorHex}>{String(value)}</span>
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
                    <span className={uiStyles.colorHex}>{String(value)}</span>
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
      </main>
    </div>
  );
}

export default DesignSystemConfigPage;
