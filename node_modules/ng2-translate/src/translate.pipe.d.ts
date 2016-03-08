import { PipeTransform, EventEmitter, OnDestroy } from 'angular2/core';
import { TranslateService } from './translate.service';
export declare class TranslatePipe implements PipeTransform, OnDestroy {
    translate: TranslateService;
    value: string;
    lastKey: string;
    lastParams: any[];
    onLangChange: EventEmitter<any>;
    constructor(translate: TranslateService);
    /**
     * Determines if a value is a regular expression object.
     *
     * @private
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `RegExp`.
     */
    private isRegExp(value);
    /**
     * @name equals
     *
     * @description
     * Determines if two objects or two values are equivalent. Supports value types, regular
     * expressions, arrays and objects.
     *
     * Two objects or values are considered equivalent if at least one of the following is true:
     *
     * * Both objects or values pass `===` comparison.
     * * Both objects or values are of the same type and all of their properties are equal by
     *   comparing them with `angular.equals`.
     * * Both values are NaN. (In JavaScript, NaN == NaN => false. But we consider two NaN as equal)
     * * Both values represent the same regular expression (In JavaScript,
     *   /abc/ == /abc/ => false. But we consider two regular expressions as equal when their textual
     *   representation matches).
     *
     * During a property comparison, properties of `function` type and properties with names
     * that begin with `$` are ignored.
     *
     * @param {*} o1 Object or value to compare.
     * @param {*} o2 Object or value to compare.
     * @returns {boolean} True if arguments are equal.
     */
    private equals(o1, o2);
    updateValue(key: string, interpolateParams?: Object): void;
    transform(query: string, args: any[]): any;
    /**
     * Clean any existing subscription to onLangChange events
     * @private
     */
    _dispose(): void;
    ngOnDestroy(): any;
}
