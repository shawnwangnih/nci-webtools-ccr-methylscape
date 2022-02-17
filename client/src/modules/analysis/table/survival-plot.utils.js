import { groupBy } from 'lodash';

export function getSurvivalPlot(data, includeCensors = true) {
    let traces = [];
    let layout = {
        margin: { t: 0 },
        xaxis: {
            title: 'Overall Survival (months)',
        },
        yaxis: {
            title: 'Survival Probability',
        },
        hovermode: 'x',
    };

    if (!data) {
        return {data: traces, layout};
    }

    const xKey = 'time';
    const yKey = 'surv';
    const censorKey = 'n.censor';

    const groups = groupBy(data, 'strata');

    for (let name in groups) {
        let rows = groups[name];

        const curve = {
            name,
            x: rows.map((row) => row[xKey]),
            y: rows.map((row) => row[yKey]),
            line: { shape: 'hv' },
            mode: 'lines',
            type: 'scatter',
        };

        traces.push(curve);

        if (includeCensors) {
            const censoredRows = rows.filter(row => row[censorKey] > 0);
            const censors = {
                x: censoredRows.map(row => row[xKey]),
                y: censoredRows.map(row => row[yKey]),
                mode: 'markers',
                type: 'scatter',
                showlegend: false,
                hoverinfo: 'skip',
                marker: {
                    size: 4,
                    symbol: '203',
                    opacity: 0.2,
                },
            };
            traces.push(censors);
        }
    }

    return {data: traces, layout};
}
