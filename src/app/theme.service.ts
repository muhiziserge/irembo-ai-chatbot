import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  pageIsDark = signal(false);

  togglePageDark(): void {
    this.pageIsDark.update(v => !v);
  }
}
