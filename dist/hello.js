System.register(['angular2/core', 'angular2/platform/browser', 'ng2-translate/ng2-translate', 'angular2/http'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, browser_1, ng2_translate_1, http_1;
    var HelloApp;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (ng2_translate_1_1) {
                ng2_translate_1 = ng2_translate_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            }],
        execute: function() {
            HelloApp = (function () {
                function HelloApp(translate) {
                    this.translate = translate;
                    this.name = 'World';
                    var userLang = navigator.language.split('-')[0];
                    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'en';
                    translate.use(userLang);
                }
                HelloApp = __decorate([
                    core_1.Injectable(),
                    core_1.Component({
                        selector: 'hello-app',
                        template: "\n        <h1>Hello, {{name}}!</h1>\n        Say \"<b>{{ 'HELLO' | translate:'{value: \"world\"}' }}</b>\" to: <input [value]=\"name\" (input)=\"name = $event.target.value\">\n        <br/>\n        Change language:\n        <select (change)=\"translate.use($event.target.value)\">\n            <option *ngFor=\"#lang of ['fr', 'en']\" [selected]=\"lang === translate.currentLang\">{{lang}}</option>\n        </select>\n    ",
                        pipes: [ng2_translate_1.TranslatePipe]
                    }), 
                    __metadata('design:paramtypes', [ng2_translate_1.TranslateService])
                ], HelloApp);
                return HelloApp;
            }());
            exports_1("HelloApp", HelloApp);
            browser_1.bootstrap(HelloApp, [http_1.HTTP_PROVIDERS, ng2_translate_1.TRANSLATE_PROVIDERS]);
        }
    }
});
