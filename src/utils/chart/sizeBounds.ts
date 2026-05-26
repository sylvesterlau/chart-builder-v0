export function getChartSizeBounds(
  frameWidth: number,
  sizeMinRatio: number,
  sizeMaxRatio: number,
) {
  return {
    min: Math.round(frameWidth * sizeMinRatio),
    max: Math.round(frameWidth * sizeMaxRatio),
  };
}
