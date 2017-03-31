import { Component, Input } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'app-load-button',
    templateUrl: 'load-button.component.html'
})
export class LoadButtonComponent {
  @Input() loading = false;
  @Input() onClick: Function;

  onButtonClick(event) {
    if (this.onClick) {
      return this.onClick(event);
    }
  }
}
