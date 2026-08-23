import { Component, computed, input } from '@angular/core';

import { WeightEntry } from '../../core/models/profile.model';

interface Point {
  x: number;
  y: number;
}

const WIDTH = 600;
const HEIGHT = 220;
const PADDING = 24;

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

  points = computed<Point[]>(() => {
    const data = this.entries();
    if (data.length === 0) {
      return [];
    }

    const weights = data.map(entry => entry.weightKg);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight || 1;

    const usableWidth = WIDTH - PADDING * 2;
    const usableHeight = HEIGHT - PADDING * 2;

    return data.map((entry, index) => {
      const x = data.length === 1
        ? PADDING + usableWidth / 2
        : PADDING + (index / (data.length - 1)) * usableWidth;
      const y = PADDING + usableHeight - ((entry.weightKg - minWeight) / weightRange) * usableHeight;
      return { x, y };
    });
  });

  polylinePoints = computed(() => this.points().map(p => `${p.x},${p.y}`).join(' '));
}
