import {Component, EventEmitter, Input, NgModule, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
@Component({selector:'mat-select-filter',template:`<input class="w-full p-3" [attr.aria-label]="placeholder" [placeholder]="placeholder" (keydown)="$event.stopPropagation()" (input)="filter($any($event.target).value)">`})
export class SelectFilterComponent {
 @Input() array: any[]=[]; @Input() displayMember=''; @Input() placeholder='Ara';
 @Input() color: string; @Input() noResultsMessage='Sonuç yok'; @Input() showSpinner=false;
 @Output() filteredReturn=new EventEmitter<any[]>();
 filter(value: string):void { const term=value.toLocaleLowerCase('tr'); this.filteredReturn.emit((this.array||[]).filter(x=>String(this.displayMember?x[this.displayMember]:x).toLocaleLowerCase('tr').includes(term))); }
}
@NgModule({declarations:[SelectFilterComponent],imports:[CommonModule],exports:[SelectFilterComponent]})
export class MatSelectFilterModule {}
