'use strict';

import {CustomScroll} from './../src/scripts/main';

class EventMock {
    constructor(type) {
        return {type: type};
    }
}

class ElementCoreMock {
    offsetHeight = 0;
    offsetTop = 0;
    scrollHeight = 0;
    children = [];

    constructor() {}

    addEventListener (name, callback) {
        this.listeners[name] = callback;
    }

    dispatchEvent(e) {
        this.listeners[e.type]();
    }

    classList = {
        add: (className) => {
            if (this.classes.indexOf(className) === -1)
                this.classes.push(className);
        },

        remove: (className) => {
            var index = this.classes.indexOf(className);

            if (index > -1)
                this.classes.splice(index, 1);
        },

        contains: (className) => this.classes.indexOf(className) > -1,
    };

    style = {
        setProperty: (name, value) => {
            if (name === 'height')
                this.offsetHeight = parseInt(value, 10);

            if (name === 'top')
                this.offsetTop = parseInt(value, 10);

            this.style[name] = value;
        }
    };

    private classes = [];
    private listeners = {};
}

class ElementMock extends ElementCoreMock {
    constructor(props) {
        super();

        this.set(props);
    }

    set(props) {
        Object.keys(props).forEach((key) => this[key] = props[key]);

        return this;
    }

    querySelector(selector) {
        if (selector.charAt(0) === '.')
            for (let child of this.children) {
                if (child.classList.contains(selector.substring(1)))
                    return child;
            }

        return null;
    }

    executeMutation() {}
}

class DOMObserverMock {
    private callback = null;
    private node = null;

    constructor(callback) {
        this.callback = callback;
    }

    observe(node) {
        this.node = node;

        this.node.executeMutation = () => this.callback();
    }
}

class CustomScrollDriver {
    customScroll;

    constructor() {}

    modules = {
        DOMObserver: DOMObserverMock
    };

    nodes = {
        el: null,
        shifted: null,
        content: null,
        bar: null,
        thumb: null,
    };
    
    given = {
        nodes: (nodes) => {
            this.given.node('content', nodes.content)
                .given.node('shifted', nodes.shifted, [this.nodes.content])
                .given.node('thumb', nodes.thumb)
                .given.node('bar', nodes.bar, [this.nodes.thumb])
                .given.node('el', nodes.el, [this.nodes.shifted, this.nodes.bar]);

            return this;
        },

        node: (name, props, children = []) => {
            var node = this.nodes[name] = this.nodes[name]
                ? this.nodes[name].set(props)
                : new ElementMock(props);

            node.children = children;
            node.classList.add(name);

            return this;
        },
        
        listener: (type, callback) => {
            this.customScroll
                .addListener(type, callback);

            return this;
        }
    };

    when = {
        instantiated: () => {
            this.customScroll = new CustomScroll(
                this.nodes.el,
                // DocumentMock,
                this.modules.DOMObserver
            );

            return this;
        },

        domMutated: () => {
            this.nodes.content.executeMutation();

            return this;
        },

        scrolled: (distance = 0) => {
            this.nodes.shifted.scrollTop += distance;
            this.nodes.shifted.dispatchEvent(new EventMock('scroll'));
        }
    };


}

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
