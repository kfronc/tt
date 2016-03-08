"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var translate_service_1 = require('./translate.service');
var lang_1 = require("angular2/src/facade/lang");
var TranslatePipe = (function () {
    function TranslatePipe(translate) {
        this.value = '';
        this.translate = translate;
    }
    /**
     * Determines if a value is a regular expression object.
     *
     * @private
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `RegExp`.
     */
    TranslatePipe.prototype.isRegExp = function (value) {
        return toString.call(value) === '[object RegExp]';
    };
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
    TranslatePipe.prototype.equals = function (o1, o2) {
        if (o1 === o2)
            return true;
        if (o1 === null || o2 === null)
            return false;
        if (o1 !== o1 && o2 !== o2)
            return true; // NaN === NaN
        var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
        if (t1 == t2 && t1 == 'object') {
            if (lang_1.isArray(o1)) {
                if (!lang_1.isArray(o2))
                    return false;
                if ((length = o1.length) == o2.length) {
                    for (key = 0; key < length; key++) {
                        if (!this.equals(o1[key], o2[key]))
                            return false;
                    }
                    return true;
                }
            }
            else if (lang_1.isDate(o1)) {
                if (!lang_1.isDate(o2))
                    return false;
                return this.equals(o1.getTime(), o2.getTime());
            }
            else if (this.isRegExp(o1)) {
                if (!this.isRegExp(o2))
                    return false;
                return o1.toString() == o2.toString();
            }
            else {
                if (lang_1.isArray(o2) || lang_1.isDate(o2) || this.isRegExp(o2))
                    return false;
                keySet = Object.create(null);
                for (key in o1) {
                    if (key.charAt(0) === '$' || lang_1.isFunction(o1[key]))
                        continue;
                    if (!this.equals(o1[key], o2[key]))
                        return false;
                    keySet[key] = true;
                }
                for (key in o2) {
                    if (!(key in keySet) && key.charAt(0) !== '$' && typeof o2[key] !== 'undefined' && !lang_1.isFunction(o2[key]))
                        return false;
                }
                return true;
            }
        }
        return false;
    };
    TranslatePipe.prototype.updateValue = function (key, interpolateParams) {
        var _this = this;
        this.translate.get(key, interpolateParams).subscribe(function (res) {
            _this.value = res ? res : key;
        });
    };
    TranslatePipe.prototype.transform = function (query, args) {
        var _this = this;
        if (query.length === 0) {
            return query;
        }
        // if we ask another time for the same key, return the last value
        if (this.equals(query, this.lastKey) && this.equals(args, this.lastParams)) {
            return this.value;
        }
        var interpolateParams;
        if (args.length && args[0] !== null) {
            if (typeof args[0] === 'string' && args[0].length) {
                // we accept objects written in the template such as {n:1},
                // which is why we might need to change it to real JSON objects such as {"n":1}
                try {
                    interpolateParams = JSON.parse(args[0].replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": '));
                }
                catch (e) {
                    throw new SyntaxError("Wrong parameter in TranslatePipe. Expected a valid Object, received: " + args[0]);
                }
            }
            else if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
                interpolateParams = args[0];
            }
        }
        // store the query, in case it changes
        this.lastKey = query;
        // store the params, in case they change
        this.lastParams = args;
        // set the value
        this.updateValue(query, interpolateParams);
        // if there is a subscription to onLangChange, clean it
        this._dispose();
        // subscribe to onLangChange event, in case the language changes
        this.onLangChange = this.translate.onLangChange.subscribe(function (params) {
            _this.updateValue(query, interpolateParams);
        });
        return this.value;
    };
    /**
     * Clean any existing subscription to onLangChange events
     * @private
     */
    TranslatePipe.prototype._dispose = function () {
        if (lang_1.isPresent(this.onLangChange)) {
            this.onLangChange.unsubscribe();
            this.onLangChange = undefined;
        }
    };
    TranslatePipe.prototype.ngOnDestroy = function () {
        this._dispose();
    };
    TranslatePipe = __decorate([
        core_1.Injectable(),
        core_1.Pipe({
            name: 'translate',
            pure: false // required to update the value when the promise is resolved
        }), 
        __metadata('design:paramtypes', [translate_service_1.TranslateService])
    ], TranslatePipe);
    return TranslatePipe;
}());
exports.TranslatePipe = TranslatePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2xhdGUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUJBQXVFLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZGLGtDQUErQixxQkFBcUIsQ0FBQyxDQUFBO0FBQ3JELHFCQUFxRCwwQkFBMEIsQ0FBQyxDQUFBO0FBT2hGO0lBT0ksdUJBQVksU0FBMkI7UUFMdkMsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQU1mLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSyxnQ0FBUSxHQUFoQixVQUFpQixLQUFVO1FBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLGlCQUFpQixDQUFDO0lBQ3RELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F1Qkc7SUFDSyw4QkFBTSxHQUFkLFVBQWUsRUFBTyxFQUFFLEVBQU87UUFDM0IsRUFBRSxDQUFBLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDMUIsRUFBRSxDQUFBLENBQUMsRUFBRSxLQUFLLElBQUksSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUM1QyxFQUFFLENBQUEsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYztRQUN0RCxJQUFJLEVBQUUsR0FBRyxPQUFPLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxFQUFFLEVBQUUsTUFBYyxFQUFFLEdBQVEsRUFBRSxNQUFXLENBQUM7UUFDMUUsRUFBRSxDQUFBLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztZ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Q0gsZ0NBQVEsR0FBUjtRQUNJLEVBQUUsQ0FBQSxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBRUQsbUNBQVcsR0FBWDtRQUNJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBdkpMO1FBQUMsaUJBQVUsRUFBRTtRQUNaLFdBQUksQ0FBQztZQUNGLElBQUksRUFBRSxXQUFXO1lBQ2pCLElBQUksRUFBRSxLQUFLLENBQUMsNERBQTREO1NBQzNFLENBQUM7O3FCQUFBO0lBb0pGLG9CQUFDO0FBQUQsQ0FBQyxBQW5KRCxJQW1KQztBQW5KWSxxQkFBYSxnQkFtSnpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1BpcGVUcmFuc2Zvcm0sIFBpcGUsIEluamVjdGFibGUsIEV2ZW50RW1pdHRlciwgT25EZXN0cm95fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7VHJhbnNsYXRlU2VydmljZX0gZnJvbSAnLi90cmFuc2xhdGUuc2VydmljZSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNBcnJheSwgaXNEYXRlLCBpc0Z1bmN0aW9ufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5cbkBJbmplY3RhYmxlKClcbkBQaXBlKHtcbiAgICBuYW1lOiAndHJhbnNsYXRlJyxcbiAgICBwdXJlOiBmYWxzZSAvLyByZXF1aXJlZCB0byB1cGRhdGUgdGhlIHZhbHVlIHdoZW4gdGhlIHByb21pc2UgaXMgcmVzb2x2ZWRcbn0pXG5leHBvcnQgY2xhc3MgVHJhbnNsYXRlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0sIE9uRGVzdHJveSB7XG4gICAgdHJhbnNsYXRlOiBUcmFuc2xhdGVTZXJ2aWNlO1xuICAgIHZhbHVlOiBzdHJpbmcgPSAnJztcbiAgICBsYXN0S2V5OiBzdHJpbmc7XG4gICAgbGFzdFBhcmFtczogYW55W107XG4gICAgb25MYW5nQ2hhbmdlOiBFdmVudEVtaXR0ZXI8YW55PjtcblxuICAgIGNvbnN0cnVjdG9yKHRyYW5zbGF0ZTogVHJhbnNsYXRlU2VydmljZSkge1xuICAgICAgICB0aGlzLnRyYW5zbGF0ZSA9IHRyYW5zbGF0ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGlmIGEgdmFsdWUgaXMgYSByZWd1bGFyIGV4cHJlc3Npb24gb2JqZWN0LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFJlZmVyZW5jZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBgdmFsdWVgIGlzIGEgYFJlZ0V4cGAuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1JlZ0V4cCh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG5hbWUgZXF1YWxzXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBEZXRlcm1pbmVzIGlmIHR3byBvYmplY3RzIG9yIHR3byB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQuIFN1cHBvcnRzIHZhbHVlIHR5cGVzLCByZWd1bGFyXG4gICAgICogZXhwcmVzc2lvbnMsIGFycmF5cyBhbmQgb2JqZWN0cy5cbiAgICAgKlxuICAgICAqIFR3byBvYmplY3RzIG9yIHZhbHVlcyBhcmUgY29uc2lkZXJlZCBlcXVpdmFsZW50IGlmIGF0IGxlYXN0IG9uZSBvZiB0aGUgZm9sbG93aW5nIGlzIHRydWU6XG4gICAgICpcbiAgICAgKiAqIEJvdGggb2JqZWN0cyBvciB2YWx1ZXMgcGFzcyBgPT09YCBjb21wYXJpc29uLlxuICAgICAqICogQm90aCBvYmplY3RzIG9yIHZhbHVlcyBhcmUgb2YgdGhlIHNhbWUgdHlwZSBhbmQgYWxsIG9mIHRoZWlyIHByb3BlcnRpZXMgYXJlIGVxdWFsIGJ5XG4gICAgICogICBjb21wYXJpbmcgdGhlbSB3aXRoIGBhbmd1bGFyLmVxdWFsc2AuXG4gICAgICogKiBCb3RoIHZhbHVlcyBhcmUgTmFOLiAoSW4gSmF2YVNjcmlwdCwgTmFOID09IE5hTiA9PiBmYWxzZS4gQnV0IHdlIGNvbnNpZGVyIHR3byBOYU4gYXMgZXF1YWwpXG4gICAgICogKiBCb3RoIHZhbHVlcyByZXByZXNlbnQgdGhlIHNhbWUgcmVndWxhciBleHByZXNzaW9uIChJbiBKYXZhU2NyaXB0LFxuICAgICAqICAgL2FiYy8gPT0gL2FiYy8gPT4gZmFsc2UuIEJ1dCB3ZSBjb25zaWRlciB0d28gcmVndWxhciBleHByZXNzaW9ucyBhcyBlcXVhbCB3aGVuIHRoZWlyIHRleHR1YWxcbiAgICAgKiAgIHJlcHJlc2VudGF0aW9uIG1hdGNoZXMpLlxuICAgICAqXG4gICAgICogRHVyaW5nIGEgcHJvcGVydHkgY29tcGFyaXNvbiwgcHJvcGVydGllcyBvZiBgZnVuY3Rpb25gIHR5cGUgYW5kIHByb3BlcnRpZXMgd2l0aCBuYW1lc1xuICAgICAqIHRoYXQgYmVnaW4gd2l0aCBgJGAgYXJlIGlnbm9yZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0geyp9IG8xIE9iamVjdCBvciB2YWx1ZSB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7Kn0gbzIgT2JqZWN0IG9yIHZhbHVlIHRvIGNvbXBhcmUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgYXJndW1lbnRzIGFyZSBlcXVhbC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGVxdWFscyhvMTogYW55LCBvMjogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmKG8xID09PSBvMikgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmKG8xID09PSBudWxsIHx8IG8yID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmKG8xICE9PSBvMSAmJiBvMiAhPT0gbzIpIHJldHVybiB0cnVlOyAvLyBOYU4gPT09IE5hTlxuICAgICAgICB2YXIgdDEgPSB0eXBlb2YgbzEsIHQyID0gdHlwZW9mIG8yLCBsZW5ndGg6IG51bWJlciwga2V5OiBhbnksIGtleVNldDogYW55O1xuICAgICAgICBpZih0MSA9PSB0MiAmJiB0MSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgaWYoaXNBcnJheShvMSkpIHtcbiAgICAgICAgICAgICAgICBpZighaXNBcnJheShvMikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZigobGVuZ3RoID0gbzEubGVuZ3RoKSA9PSBvMi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgPSAwOyBrZXkgPCBsZW5ndGg7IGtleSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZighdGhpcy5lcXVhbHMobzFba2V5XSwgbzJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYoaXNEYXRlKG8xKSkge1xuICAgICAgICAgICAgICAgIGlmKCFpc0RhdGUobzIpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKG8xLmdldFRpbWUoKSwgbzIuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZih0aGlzLmlzUmVnRXhwKG8xKSkge1xuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmlzUmVnRXhwKG8yKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBvMS50b1N0cmluZygpID09IG8yLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKGlzQXJyYXkobzIpIHx8IGlzRGF0ZShvMikgfHwgdGhpcy5pc1JlZ0V4cChvMikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBrZXlTZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIG8xKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGtleS5jaGFyQXQoMCkgPT09ICckJyB8fCBpc0Z1bmN0aW9uKG8xW2tleV0pKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXRoaXMuZXF1YWxzKG8xW2tleV0sIG8yW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGtleVNldFtrZXldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gbzIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIShrZXkgaW4ga2V5U2V0KSAmJiBrZXkuY2hhckF0KDApICE9PSAnJCcgJiYgdHlwZW9mIG8yW2tleV0gIT09ICd1bmRlZmluZWQnICYmICFpc0Z1bmN0aW9uKG8yW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGVWYWx1ZShrZXk6IHN0cmluZywgaW50ZXJwb2xhdGVQYXJhbXM/OiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy50cmFuc2xhdGUuZ2V0KGtleSwgaW50ZXJwb2xhdGVQYXJhbXMpLnN1YnNjcmliZSgocmVzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSByZXMgPyByZXMgOiBrZXk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybShxdWVyeTogc3RyaW5nLCBhcmdzOiBhbnlbXSk6IGFueSB7XG4gICAgICAgIGlmIChxdWVyeS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBxdWVyeTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiB3ZSBhc2sgYW5vdGhlciB0aW1lIGZvciB0aGUgc2FtZSBrZXksIHJldHVybiB0aGUgbGFzdCB2YWx1ZVxuICAgICAgICBpZiAodGhpcy5lcXVhbHMocXVlcnksIHRoaXMubGFzdEtleSkgJiYgdGhpcy5lcXVhbHMoYXJncywgdGhpcy5sYXN0UGFyYW1zKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW50ZXJwb2xhdGVQYXJhbXM6IE9iamVjdDtcbiAgICAgICAgaWYoYXJncy5sZW5ndGggJiYgYXJnc1swXSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYodHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnICYmIGFyZ3NbMF0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gd2UgYWNjZXB0IG9iamVjdHMgd3JpdHRlbiBpbiB0aGUgdGVtcGxhdGUgc3VjaCBhcyB7bjoxfSxcbiAgICAgICAgICAgICAgICAvLyB3aGljaCBpcyB3aHkgd2UgbWlnaHQgbmVlZCB0byBjaGFuZ2UgaXQgdG8gcmVhbCBKU09OIG9iamVjdHMgc3VjaCBhcyB7XCJuXCI6MX1cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0ZVBhcmFtcyA9IEpTT04ucGFyc2UoYXJnc1swXS5yZXBsYWNlKC8oWydcIl0pPyhbYS16QS1aMC05X10rKShbJ1wiXSk/Oi9nLCAnXCIkMlwiOiAnKSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgV3JvbmcgcGFyYW1ldGVyIGluIFRyYW5zbGF0ZVBpcGUuIEV4cGVjdGVkIGEgdmFsaWQgT2JqZWN0LCByZWNlaXZlZDogJHthcmdzWzBdfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YgYXJnc1swXSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoYXJnc1swXSkpIHtcbiAgICAgICAgICAgICAgICBpbnRlcnBvbGF0ZVBhcmFtcyA9IGFyZ3NbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9yZSB0aGUgcXVlcnksIGluIGNhc2UgaXQgY2hhbmdlc1xuICAgICAgICB0aGlzLmxhc3RLZXkgPSBxdWVyeTtcblxuICAgICAgICAvLyBzdG9yZSB0aGUgcGFyYW1zLCBpbiBjYXNlIHRoZXkgY2hhbmdlXG4gICAgICAgIHRoaXMubGFzdFBhcmFtcyA9IGFyZ3M7XG5cbiAgICAgICAgLy8gc2V0IHRoZSB2YWx1ZVxuICAgICAgICB0aGlzLnVwZGF0ZVZhbHVlKHF1ZXJ5LCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSBzdWJzY3JpcHRpb24gdG8gb25MYW5nQ2hhbmdlLCBjbGVhbiBpdFxuICAgICAgICB0aGlzLl9kaXNwb3NlKCk7XG5cbiAgICAgICAgLy8gc3Vic2NyaWJlIHRvIG9uTGFuZ0NoYW5nZSBldmVudCwgaW4gY2FzZSB0aGUgbGFuZ3VhZ2UgY2hhbmdlc1xuICAgICAgICB0aGlzLm9uTGFuZ0NoYW5nZSA9IHRoaXMudHJhbnNsYXRlLm9uTGFuZ0NoYW5nZS5zdWJzY3JpYmUoKHBhcmFtczoge2xhbmc6IHN0cmluZywgdHJhbnNsYXRpb25zOiBhbnl9KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZhbHVlKHF1ZXJ5LCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFuIGFueSBleGlzdGluZyBzdWJzY3JpcHRpb24gdG8gb25MYW5nQ2hhbmdlIGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Rpc3Bvc2UoKSB7XG4gICAgICAgIGlmKGlzUHJlc2VudCh0aGlzLm9uTGFuZ0NoYW5nZSkpIHtcbiAgICAgICAgICAgIHRoaXMub25MYW5nQ2hhbmdlLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB0aGlzLm9uTGFuZ0NoYW5nZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCk6IGFueSB7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgICB9XG59XG4iXX0=