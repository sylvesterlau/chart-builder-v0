// 图表基础配置
export const chartConfig = {
  name: "Semi-donut Chart",
  size: 318,
  ratio: 0.88,
  defaultColor: { r: 0.204, g: 0.471, b: 0.576 },
};

export const dataVisColor = [
  {
    key: "semantic.color.fill.dataVis.general.01",
    value: "#347893",
  },
  {
    key: "semantic.color.fill.dataVis.general.02",
    value: "#E76E84",
  },
  {
    key: "semantic.color.fill.dataVis.general.03",
    value: "#518827",
  },
  {
    key: "semantic.color.fill.dataVis.general.04",
    value: "#EC7046",
  },
  {
    key: "semantic.color.fill.dataVis.general.05",
    value: "#509EBC",
  },
];

// chart sample data
export const sampleData = {
  spending: {
    data: [
      { label: "Shopping", value: 5020 },
      { label: "Travel", value: 2521 },
      { label: "Food", value: 1596 },
      { label: "Subscription", value: 80 },
      { label: "Other", value: 231 },
    ],
  },
};
