import { Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { debounceTime, filter, map, Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations/public-api';

@Component({
    selector     : 'search',
    templateUrl  : './search.component.html',
    encapsulation: ViewEncapsulation.None,
    exportAs     : 'fuseSearch',
    animations   : fuseAnimations
})
export class SearchComponent implements OnChanges, OnInit, OnDestroy
{
    @Input() appearance: 'basic' | 'bar' = 'basic';
    @Input() debounce: number = 300;
    @Input() minLength: number = 2;
    @Output() search: EventEmitter<any> = new EventEmitter<any>();

    opened: boolean = false;
    resultSets: any[];
    searchControl: UntypedFormControl = new UntypedFormControl();
    private _matAutocomplete: MatAutocomplete;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _elementRef: ElementRef,
        private _httpClient: HttpClient,
        private _renderer2: Renderer2
    )
    {
    }

    @HostBinding('class') get classList(): any
    {
        return {
            'search-appearance-bar'  : this.appearance === 'bar',
            'search-appearance-basic': this.appearance === 'basic',
            'search-opened'          : this.opened
        };
    }

    @ViewChild('barSearchInput')
    set barSearchInput(value: ElementRef)
    {
        if ( value )
        {
            setTimeout(() => {
                value.nativeElement.focus();
            });
        }
    }

    @ViewChild('matAutocomplete')
    set matAutocomplete(value: MatAutocomplete)
    {
        this._matAutocomplete = value;
    }

    ngOnChanges(changes: SimpleChanges): void
    {
        if ( 'appearance' in changes )
        {
            this.close();
        }
    }

    ngOnInit(): void
    {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                takeUntil(this._unsubscribeAll),
                map((value) => {
                    if ( !value || value.length < this.minLength )
                    {
                        this.resultSets = null;
                    }
                    return value;
                }),
                filter(value => value && value.length >= this.minLength)
            )
            .subscribe((value) => {
                this._httpClient.post('api/common/search', {query: value})
                    .subscribe((resultSets: any) => {
                        this.resultSets = resultSets;
                        this.search.next(resultSets);
                    });
            });
    }

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onKeydown(event: KeyboardEvent): void
    {
        if ( event.code === 'Escape' )
        {
            if ( this.appearance === 'bar' && !this._matAutocomplete.isOpen )
            {
                this.close();
            }
        }
    }

    open(): void
    {
        if ( this.opened )
        {
            return;
        }
        this.opened = true;
    }

    close(): void
    {
        if ( !this.opened )
        {
            return;
        }

        this.searchControl.setValue('');
        this.opened = false;
    }

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
