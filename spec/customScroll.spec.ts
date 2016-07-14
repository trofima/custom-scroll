'use strict';

import {CustomScroll} from './../src/scripts/customScroll';
import {CustomScrollDriver} from './driver';

describe(`Class CustomScroll.`, function() {
    describe(`static checkEvent:`, function() {
        it(`should throw type error, if invalid event type passed`, function() {
            expect(() => CustomScroll.checkEvent('invalid'))
                .toThrowError(
                    "\nEvent type 'invalid' is not supported." +
                    "\nSupported events are: scroll, change." +
                    "\n"
                );
        });
    });

    describe(`constructor:`, function() {
        beforeEach(function() {
            this.driver = new CustomScrollDriver();

            this.driver
                .given.nodes({
                    el: {offsetHeight: 100},
                    shifted: {offsetHeight: 100, scrollHeight: 200, scrollTop: 0},
                    content: {},
                    bar: {offsetHeight: 100},
                    thumb: {offsetHeight: 0},
                })
                .when.instantiated();
        });
        
        it(`should fix default styling for the case 
        when native scrollbar has width (non mac os systems)`, function() {
            this.driver
                .given.node('shifted', {offsetWidth: 210, clientWidth: 200})
                .when.domMutated();
            
            expect(this.driver.nodes.shifted.style.getPropertyValue('margin-right'))
                .toBe('-10px');

            expect(this.driver.nodes.content.style.getPropertyValue('margin-right'))
                .toBe('0px');
        });

        it(`should calculate scroll thumb height`, function() {
            this.driver.when.domMutated();

            expect(this.driver.nodes.thumb.offsetHeight).toBe(50);
        });

        it(`should add visible class to root element`, function() {
            this.driver.when.domMutated();

            expect(this.driver.nodes.el.classList.contains('visible')).toBe(true);
        });

        it(`should remove visible class from root element`, function() {
            this.driver
                .when.domMutated()
                .given.node('shifted', {scrollHeight: 100})
                .when.domMutated();

            expect(this.driver.nodes.el.classList.contains('visible')).toBe(false);
        });

        it(`should move thumb on scroll`, function() {
            this.driver
                .when.scrolled(100);
            
            expect(this.driver.nodes.thumb.offsetTop).toBe(50);
        });

        it(`should scroll when 'thumb' is dragging`, function() {

        });
    });

    describe(`addListener`, function() {
        beforeEach(function() {
            this.driver = new CustomScrollDriver();

            this.driver
                .given.nodes({
                    el: {offsetHeight: 100},
                    shifted: {offsetHeight: 100, scrollHeight: 200, scrollTop: 0},
                    content: {},
                    bar: {},
                    thumb: {offsetHeight: 0},
                })
                .when.instantiated();
        });

        it(`should throw TypeError if listener has wrong type`, function() {
            expect(() => this.driver.customScroll.addListener('wrong', () => {}))
                .toThrowError(<any>TypeError);
        });

        it(`should register 'change' listener`, function() {
            var changeListener = jasmine.createSpy('changeListener');

            this.driver.customScroll.addListener('change', changeListener);
            
            this.driver.when.domMutated();

            expect(changeListener).toHaveBeenCalledWith({
                offsetHeight: 100,
                scrollHeight: 200,
                scrollTop: 0,
            });
        });

        it(`should register 'scroll' listener`, function() {
            var scrollListener = jasmine.createSpy('scrollListener');

            this.driver.customScroll.addListener('scroll', scrollListener);

            this.driver.when.scrolled();

            expect(scrollListener).toHaveBeenCalledWith({
                offsetHeight: 100,
                scrollHeight: 200,
                scrollTop: 0,
            });
        });
    });
});
