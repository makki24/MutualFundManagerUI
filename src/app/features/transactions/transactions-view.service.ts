import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type TransactionsViewMode = 'table' | 'timeline';

@Injectable({ providedIn: 'root' })
export class TransactionsViewService {
  private readonly STORAGE_KEY = 'transactions_view_mode';
  private readonly _viewMode$ = new BehaviorSubject<TransactionsViewMode>(this.readInitial());

  get viewMode$(): Observable<TransactionsViewMode> {
    return this._viewMode$.asObservable();
  }

  get current(): TransactionsViewMode {
    return this._viewMode$.getValue();
  }

  set(mode: TransactionsViewMode): void {
    if (mode !== 'table' && mode !== 'timeline') return;
    this._viewMode$.next(mode);
    this.persist(mode);
  }

  private readInitial(): TransactionsViewMode {
    try {
      const v = localStorage.getItem(this.STORAGE_KEY) as TransactionsViewMode | null;
      return v === 'timeline' ? 'timeline' : 'table';
    } catch {
      return 'table';
    }
  }

  private persist(mode: TransactionsViewMode): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, mode);
    } catch {}
  }
}
