import { parse } from 'papaparse';

export default async function nciMetricColors() {
  const csvText = await await (
    await fetch('assets/data/nciMetricColors.csv')
  ).text();
  // replace header in csv
  const newHeader = ['nciMetric,color', ...csvText.split('\r\n').slice(1)].join(
    '\r\n'
  );
  const { data } = parse(newHeader, { header: true });
  const mapColors = data.reduce(
    (obj, e) => ((obj[e.nciMetric] = e.color), obj),
    {}
  );

  return mapColors;
}
