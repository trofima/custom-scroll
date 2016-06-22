'use strict';

import {CustomScroll} from './../src/scripts/main';

class ElementMock {
    offsetHeight = 0;
    offsetTop = 0;
    scrollHeight = 0;
    children = [];

    constructor(props) {
        // super();

        Object.keys(props).forEach((key) => this[key] = props[key]);
    }

    querySelector(selector) {
        if (selector.charAt(0) === '.')
            for (let child of this.children) {
                if (child.classList.contains(selector.substring(1)))
                    return child;
            }

        return null;
    }

    executeMutation(){}


    // core imitation

    private classes = [];

    classList = {
        add: (className) => {
            if (this.classes.indexOf(className) === -1)
                this.classes.push(className);
        },

        contains: (className) => this.classes.indexOf(className) > -1,
    };

    style = {
        setProperty: (name, value) => {
            if (name === 'height')
                this.offsetHeight = parseInt(value, 10);

            this.style[name] = value;
        }
    };
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

    when = {
        instantiated: () => {
            this.customScroll = new CustomScroll(
                this.nodes.el,
                // DocumentMock,
                this.modules.DOMObserver
            );

            return this;
        },

        nodes: (nodes) => {
            this.when.node('content', nodes.content)
                .when.node('shifted', nodes.shifted, [this.nodes.content])
                .when.node('thumb', nodes.thumb)
                .when.node('bar', nodes.bar, [this.nodes.thumb])
                .when.node('el', nodes.el, [this.nodes.shifted, this.nodes.bar]);

            return this;
        },

        node: (name, params, children = []) => { // TODO: change existing el settings
            var node = this.nodes[name] = new ElementMock(params);

            node.children = children;
            node.classList.add(name);

            return this;
        },

        domMutated: () => this.nodes.content.executeMutation(),
    };


}

describe(`Class CustomScroll.`, function() {
    describe(`constructor:`, function() {
        beforeEach(function() {
            this.driver = new CustomScrollDriver();

            this.driver
                .when.nodes({
                    el: {offsetHeight: 100},
                    shifted: {scrollHeight: 200},
                    content: {},
                    bar: {},
                    thumb: {offsetHeight: 0},
                })
                .when.instantiated()
                .when.domMutated();
        });

        it(`should calculate scroll thumb height`, function() {
            expect(this.driver.nodes.thumb.offsetHeight).toBe(50);
        });

        it(`should add visible class to root element`, function() {
            expect(this.driver.nodes.el.classList.contains('visible')).toBe(true);
        });

        it(`should remove visible class from root element`, function() {
            this.driver
                .when.node('shifted', {scrollHeight: 100})
                .when.domMutated();

            expect(this.driver.nodes.el.classList.contains('visible')).toBe(false);
        });
    });
});
