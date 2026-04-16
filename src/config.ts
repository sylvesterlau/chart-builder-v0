//Plugin UI window size
export const pluginUI = {
  size: {
    width: 348,
    height: 490,
  },
};
// Semi-donut chart config
export const chartConfig = {
  name: "Semi-donut Chart",
  size: 318,
  ratio: 0.88,
  defaultColor: "#DB0011",
};
//Team library keys
export const teamLibrary = {
  coreToolKit: {
    // Collection key - "Theme" in "Hive Design Toolkit"
    collectionKey: "fec4283aa350a349f70764fc8e255b6b715e7ed1",
  },
  dataVis: {
    legend: {
      // Component key - Legend tile
      compKey: "fcfb9896b3b383b521e4b4e7177859cd97e0c1ff",
    },
    legendBD: {
      // Legend with balance display
      compKey: "91f9bc88765097d2d29b80469987c1413bb6d8c4",
    },
    balanceDisplay: {
      // Balance Display - Size=Medium, Type=Default
      compKey: "fd0426bd521c439b65408ad3d5fcd262d010f179",
    },
  },
};
// Data Vis color tokens
export const dataVisColor = [
  {
    name: "dataVis.general.01",
    key: "875460d9abc2d89a5bb76a9a7a2e9e43d4516efa", // variable key in Figma Team Library
    value: "#347893", // fallback color
  },
  {
    name: "dataVis.general.02",
    key: "ade3677d0cf6c19280ba43cc438d6112af0657c6",
    value: "#E76E84",
  },
  {
    name: "dataVis.general.03",
    key: "2a18acdfd9be77b1f87f24a271bac3674196e6c7",
    value: "#518827",
  },
  {
    name: "dataVis.general.04",
    key: "af459e2d6f04e6f778fdadfa0392569f5404a6d6",
    value: "#EC7046",
  },
  {
    name: "dataVis.general.05",
    key: "61f03e307c88fd771dba5d5be8bb1062455e1f2a",
    value: "#509EBC",
  },
];
//
export const semanticToken = {
  textPrimayColor: {
    name: "semantic/color/text/primary/default",
    key: "59e2a1871292921181f869f6e008feec0e95dcfe",
  },
  textQuoteStyle: {
    name: "semantic/typography/content/quote/quiet",
    key: "S:79681cfc4d299ad0761a3df175aea9de8adeedb0,78255:4294",
  },
  gapNormal: {
    name: "semantic/space/item/gap/normal",
    key: "2a88de7e6865ff49110890aef32b0099ac7f4c6c",
  },
  paddingNormal: {
    name: "semantic/space/container/padding/normal",
    key: "d8e8574989ca7d977791202403ed0ea9348ade16",
  },
  bgContainerStaticStandard: {
    name: "semantic/color/background/container/static/standard",
    key: "928bfb9a7223b7912d7d9892af48e50f4709a537",
  },
};
// chart sample data
export const sampleData = {
  spending: {
    data: [
      { label: "Shopping", value: 4120.23 },
      { label: "Travel", value: 2521.41 },
      { label: "Food", value: 1596.9 },
      { label: "Subscription", value: 820.12 },
      { label: "Other", value: 492.03 },
    ],
  },
};
