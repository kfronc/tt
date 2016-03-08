/// <reference path="../typings/main.d.ts"/>
import {Component, Injectable, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {TranslateService, TranslatePipe, TRANSLATE_PROVIDERS} from 'ng2-translate/ng2-translate';
import {HTTP_PROVIDERS} from 'angular2/http';

@Injectable()
@Component({
    selector: 'hello-app',
    template: `
        <h1>Hello, {{name}}!</h1>
        Say "<b>{{ 'HELLO' | translate:'{value: "world"}' }}</b>" to: <input [value]="name" (input)="name = $event.target.value">
        <br/>
        Change language:
        <select (change)="translate.use($event.target.value)">
            <option *ngFor="#lang of ['fr', 'en']" [selected]="lang === translate.currentLang">{{lang}}</option>
        </select>
    `,
    pipes: [TranslatePipe]
})
export class HelloApp {
    name: string = 'World';

    constructor(public translate: TranslateService) {
        // use navigator lang if available
        var userLang = navigator.language.split('-')[0];
        userLang = /(fr|en)/gi.test(userLang) ? userLang : 'en';

        // this trigger the use of the french or english language after setting the translations
        translate.use(userLang);
    }
}

// Instantiate TranslateService in the bootstrap so that we can keep it as a singleton
bootstrap(HelloApp, [HTTP_PROVIDERS, TRANSLATE_PROVIDERS]);
