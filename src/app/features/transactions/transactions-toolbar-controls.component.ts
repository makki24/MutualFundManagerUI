import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransactionsViewService, TransactionsViewMode } from './transactions-view.service';

@Component({
  selector: 'app-transactions-toolbar-controls',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule, MatTooltipModule],
  template: `
    <mat-button-toggle-group
      [value]="mode"
      (change)="onChange($event.value)"
      aria-label="Toggle transactions view"
    >
      <mat-button-toggle value="table" matTooltip="Table view">
        <mat-icon>table_chart</mat-icon>
        <span class="label">Table</span>
      </mat-button-toggle>
      <mat-button-toggle value="timeline" matTooltip="Timeline view">
        <mat-icon>timeline</mat-icon>
        <span class="label">Timeline</span>
      </mat-button-toggle>
    </mat-button-toggle-group>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; }
    .label { margin-left: 6px; }
    
    @media (max-width: 768px) {
      :host {
        display: none;
      }
    }
  `]
})
export class TransactionsToolbarControlsComponent {
  private readonly view = inject(TransactionsViewService);
  mode: TransactionsViewMode = this.view.current;

  constructor() {
    this.view.viewMode$.subscribe(m => (this.mode = m));
  }

  onChange(value: TransactionsViewMode) {
    this.view.set(value);
  }
}
