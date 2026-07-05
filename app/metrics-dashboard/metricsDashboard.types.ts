export interface MetricSeries {
    points: number[];
}

export interface DashboardWidget {
    id: string;
    title: string;
    unit: string;
    series: MetricSeries;
}
