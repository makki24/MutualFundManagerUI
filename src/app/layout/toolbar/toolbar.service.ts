import { Injectable, Type, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToolbarService {
  // Page title can be overridden by features; default is derived in layout
  readonly title = signal<string | null>(null);

  // Whether to show back button; default is handled by layout
  readonly showBack = signal<boolean | null>(null);

  // Feature-provided controls component (standalone) to render in the toolbar
  readonly controls = signal<Type<any> | null>(null);

  setTitle(title: string | null) {
    this.title.set(title);
  }

  setShowBack(show: boolean | null) {
    this.showBack.set(show);
  }

  setControls(component: Type<any> | null) {
    this.controls.set(component);
  }

  clear() {
    this.title.set(null);
    this.showBack.set(null);
    this.controls.set(null);
  }
}
