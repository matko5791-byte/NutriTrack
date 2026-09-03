import { Component, computed, input } from '@angular/core';

import { WeightEntry } from '../../core/models/profile.model';

interface Point {
  x: number;
  y: number;
  weightKg: number;
  dateLabel: string;
}

interface AxisTick {
  y: number;
  label: string;
}

interface AxisLabel {
  x: number;
  label: string;
}

const WIDTH = 600;
const HEIGHT = 240;
const PADDING_LEFT = 44;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 32;
const Y_TICK_COUNT = 4;
const MAX_X_LABELS = 6;

@Component({
  selector: 'app-weight-chart',
  imports: [],
  templateUrl: './weight-chart.component.html',
  styleUrl: './weight-chart.component.scss'
})
export class WeightChartComponent {
  entries = input<WeightEntry[]>([]);

  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly plotLeft = PADDING_LEFT;
  readonly plotRight = WIDTH - PADDING_RIGHT;
  readonly plotBottom = HEIGHT - PADDING_BOTTOM;

  private weightRange = computed(() => {
    const weights = this.entries().map(entry => entry.weightKg);
    const minWeight = weights.length ? Math.min(...weights) : 0;
    const maxWeight = weights.length ? Math.max(...weights) : 1;
    return { minWeight, maxWeight, range: maxWeight - minWeight || 1 };
  });

  points = computed<Point[]>(() => {
    // Entries arrive sorted by date ascending (server sort), so index order matches date order.
    const data = this.entries();
    if (data.length === 0) {
      return [];
    }

    const { minWeight, range } = this.weightRange();
    const usableWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    return data.map((entry, index) => {
      const x = data.length === 1
        ? PADDING_LEFT + usableWidth / 2
        : PADDING_LEFT + (index / (data.length - 1)) * usableWidth;
      const y = PADDING_TOP + usableHeight - ((entry.weightKg - minWeight) / range) * usableHeight;
      return { x, y, weightKg: entry.weightKg, dateLabel: this.formatDate(entry.date) };
    });
  });

  polylinePoints = computed(() => this.points().map(p => `${p.x},${p.y}`).join(' '));

  yAxisTicks = computed<AxisTick[]>(() => {
    if (this.entries().length === 0) {
      return [];
    }

    const { minWeight, maxWeight } = this.weightRange();
    const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    return Array.from({ length: Y_TICK_COUNT }, (_, i) => {
      const fraction = i / (Y_TICK_COUNT - 1);
      const value = minWeight + fraction * (maxWeight - minWeight);
      const y = PADDING_TOP + usableHeight - fraction * usableHeight;
      return { y, label: `${value.toFixed(1)} kg` };
    });
  });

  xAxisLabels = computed<AxisLabel[]>(() => {
    const pts = this.points();
    if (pts.length === 0) {
      return [];
    }

    const step = Math.max(1, Math.ceil(pts.length / MAX_X_LABELS));

    return pts
      .filter((_, index) => index % step === 0 || index === pts.length - 1)
      .map(point => ({ x: point.x, label: point.dateLabel }));
  });

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }
}
