import axios from "axios";
import groupBy from "lodash/groupBy";
import meanBy from "lodash/meanBy";
import isNumber from "lodash/isNumber";
import colors from "./colors.json";
import nciMetricColors from "./nciMetricColors";
import { defaultPlotState } from "./metadata-plot.state";

export async function getMetadataPlot({ organSystem, embedding, search, showAnnotations, color }) {
  if (!organSystem || !embedding) return defaultPlotState;

  const { data } = await axios.get("/api/analysis/samples", { params: { embedding, organSystem } });
  const searchQueries = search.map(({ value }) => value.toLowerCase());
  const colorCategories = color.type == "categorical" ? Object.entries(groupBy(data, (e) => e[color.value])) : [];
  const weeklyAnnotations = getWeeklyAnnotations(data);
  const sampleAnnotations = getSearchAnnotations(data, searchQueries);
  const useWebGl = data.length > 1000;

  const getCategoricalMarker = createCategoricalMarker(await nciMetricColors(), colors);
  const getContinuousMarker = createContinousMarker(color);

  // Sort these keywords to the top so that their traces are rendered first and overlapped by others
  const lowPriorityKeywords = ["No_match", "Unclassified", "NotAvailable", "null"];
  const compareCategoricalData = compareWithLowPriorityKeywords(lowPriorityKeywords);

  // transform data to traces
  const dataTraces =
    color.type == "categorical"
      ? colorCategories.sort(compareCategoricalData).map(([name, data]) => ({
          ...getScatterTrace(data, useWebGl),
          marker: getCategoricalMarker(name),
          name,
        }))
      : [
          {
            ...getScatterTrace(data, useWebGl),
            marker: getContinuousMarker(data),
          },
        ];

  const organSystemLabels = {
    centralNervousSystem: "Central Nervous System",
    boneAndSoftTissue: "Bone and Soft Tissue",
    hematopoietic: "Hematopoietic",
    renal: "Renal",
    panCancer: "Pan-Cancer",
  };
  const title = `${organSystemLabels[organSystem] || organSystem} (n=${data.length})`;

  // set layout
  const layout = {
    title,
    xaxis: {
      title: `${embedding} x`,
    },
    yaxis: {
      title: `${embedding} y`,
    },
    annotations: showAnnotations
      ? [
          // ...labelAnnotations,
          ...sampleAnnotations,
          // ...classAnnotations
          ...weeklyAnnotations,
        ]
      : [...sampleAnnotations],
    uirevision: organSystem + embedding + color.value + search + showAnnotations,
    legend: { title: { text: color.label } },
    autosize: true,
    dragmode: "zoom",
  };

  const config = {
    scrollZoom: true,
  };

  return {
    data: [
      ...dataTraces,
      // classAnnotationTrace,
    ],
    layout,
    config,
  };
}

export async function createCategoricalMarker(colorMap, colors) {
  let colorCount = 0;
  return (name) => ({
    color: colorMap[name] || colors[colorCount++],
  });
}

export function createContinousMarker(color) {
  return (data) => ({
    color: data.map((e) => e[color.value]),
    colorbar: { title: color.label, dtick: color.dtick },
  });
}

export function compareWithLowPriorityKeywords(keywords) {
  return ([a], [b]) => (keywords.includes(a) ? -1 : keywords.includes(b) ? 1 : a.localeCompare(b));
}

// maximum fixed precision formatter
function toFixed(num, maxDigits = 2) {
  return isNumber(num) && !isNaN(num) ? +num.toFixed(maxDigits) : num;
}

// get scatter traces from data
function getScatterTrace(data, useWebGl = true) {
  const hovertemplate =
    [
      "Sample: %{customdata.sample}",
      "Metric: %{customdata.nciMetric}",
      "Diagnosis: %{customdata.diagnosisProvided}",
      "Sex: %{customdata.customSex}",
      "RF Purity (Absolute): %{customdata.customRfPurityAbsolute}",
      "Age: %{customdata.customAge}",
    ].join("<br>") + "<extra></extra>";

  return {
    x: data.map((e) => e.x),
    y: data.map((e) => e.y),
    customdata: data.map((d) => ({
      ...d,
      customSex: d.sex ?? "N/A",
      customRfPurityAbsolute: toFixed(d.rfPurityAbsolute, 2) ?? "N/A",
      customAge: toFixed(d.age, 2) ?? "N/A",
    })),
    mode: "markers",
    hovertemplate,
    type: useWebGl ? "scattergl" : "scatter",
  };
}

function createSearchQueryFilter(searchQueries) {
  return ({ sample, idatFilename }) =>
    (sample && searchQueries.some((query) => sample.toLowerCase().includes(query))) ||
    (idatFilename && searchQueries.some((query) => idatFilename.toLowerCase().includes(query)));
}

export function getWeeklyAnnotations(data) {
  const weeklyThreshold = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const isWeeklyAnnotation = ({ batchDate }) => batchDate && new Date(batchDate).getTime() > weeklyThreshold;
  const weeklyAnnotations = data.filter(isWeeklyAnnotation).map((value) => ({
    text: value.sample,
    x: value.x,
    y: value.y,
    showarrow: true,
  }));
  return weeklyAnnotations;
}

export function getSearchAnnotations(data, searchQueries) {
  return searchQueries.length
    ? data.filter(createSearchQueryFilter(searchQueries)).map((e) => ({
        text: e.sample || e.idatFilename,
        x: e.x,
        y: e.y,
        // showarrow: false,
      }))
    : [];
}
