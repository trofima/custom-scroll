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
                    shifted: {offsetHeight: 100, scrollHeight: 100, scrollTop: 0},
                    content: {offsetHeight: 200},
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

        it(`should add visible class to the root element`, function() {
            this.driver.when.domMutated();

            expect(this.driver.nodes.el.classList.contains('visible')).toBe(true);
        });

        it(`should remove visible class from the root element`, function() {
            this.driver
                .when.domMutated()
                .given.node('content', {offsetHeight: 100})
                .when.domMutated();

            expect(this.driver.nodes.el.classList.contains('visible')).toBe(false);
        });

        it(`should move thumb on scroll`, function() {
            this.driver
                .when.domMutated()
                .when.scrolled(100);
            
            expect(this.driver.nodes.thumb.offsetTop).toBe(50);
        });

        it(`should scroll when 'thumb' is dragging`, function() {
            this.driver
                .when.domMutated()
                .when.thumbDragged(50);

            expect(this.driver.nodes.shifted.scrollTop).toBe(100);
        });

        it(`should add class 'thumb-dragging' to the root element`, function() {
            this.driver
                .when.domMutated()
                .when.thumbDragged(50);

            expect(this.driver.nodes.el.classList.contains('thumb-dragging'))
                .toBe(true);
        });

        it(`should remove class 'thumb-dragging' from the root element 
        after thumb is dropped`, function() {
            this.driver
                .when.domMutated()
                .when.thumbDragged(50)
                .when.thumbDropped();

            expect(this.driver.nodes.el.classList.contains('thumb-dragging'))
                .toBe(false);
        });

        it(`should remove event listeners from the document 
        after thumb is dropped`, function() {
            this.driver
                .when.domMutated()
                .when.thumbDragged(50)
                .when.thumbDropped()
                .when.mouseMoved(100);

            expect(this.driver.nodes.shifted.scrollTop).toBe(100);
        });

        it(`should prevent default actions for DOM move listeners`, function() {

        });

        it(`should run 'update' only if content height was changed`, function() {
            spyOn(this.driver.customScroll, 'update');

            this.driver
                .when.domMutated()
                .when.domMutated();

            expect(this.driver.customScroll.update.calls.count()).toBe(1);
        });
    });

    describe(`addListener`, function() {
        beforeEach(function() {
            this.driver = new CustomScrollDriver();

            this.driver
                .given.nodes({
                    el: {offsetHeight: 100},
                    shifted: {offsetHeight: 100, scrollHeight: 100, scrollTop: 0},
                    content: {offsetHeight: 200},
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

            this.driver
                .when.domMutated()
                .when.scrolled();

            expect(scrollListener).toHaveBeenCalledWith({
                offsetHeight: 100,
                scrollHeight: 200,
                scrollTop: 0,
            });
        });
    });
});
