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
    name: "semantic.color.fill.dataVis.general.01",
    key: "4b0f4cc56fce48aab4632a4fd5feb3757319ac93", // variable key in Figma Team Library
    value: "#347893", // fallback color, not used
  },
  {
    name: "semantic.color.fill.dataVis.general.02",
    key: "701879c9787a87019898f2af7c6071f6d5a700a1",
    value: "#E76E84",
  },
  {
    name: "semantic.color.fill.dataVis.general.03",
    key: "1b012516a0c37279d64c78991d2df967d262f8d3",
    value: "#518827",
  },
  {
    name: "semantic.color.fill.dataVis.general.04",
    key: "76f80cda16c8af864ca6d85d35f470e899d2494a",
    value: "#EC7046",
  },
  {
    name: "semantic.color.fill.dataVis.general.05",
    key: "253877542492b9b9aa6a9eb3cdf7b06c49cf2cce",
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
