'use strict';

import {CustomScroll} from './../src/scripts/customScroll';
import {DOMObserverMock, ElementMock, EventMock, DocumentMock} from './mocks';

export class CustomScrollDriver {
    customScroll;

    constructor() {}

    modules = {
        DOMObserver: DOMObserverMock,
        document: new DocumentMock,
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
                this.modules.document,
                this.modules.DOMObserver
            );

            return this;
        },

        domMutated: () => {
            this.nodes.shifted.scrollHeight = this.nodes.content.offsetHeight;
            this.nodes.content.executeMutation();

            return this;
        },

        scrolled: (distance = 0) => {
            this.nodes.shifted.scrollTop += distance;
            this.nodes.shifted.dispatchEvent(new EventMock('scroll'));

            return this;
        },

        thumbDragged: (to = 0) => {
            this.nodes.thumb.dispatchEvent(new EventMock('mousedown', {screenY: 0}));

            this.modules.document.dispatchEvent(new EventMock('mousemove', {
                screenY: to
            }));

            return this;
        },

        thumbDropped: () => {
            this.modules.document.dispatchEvent(new EventMock('mouseup', {}));

            return this;
        },

        mouseMoved: (to = 0) => {
            this.modules.document.dispatchEvent(new EventMock('mousemove', {
                screenY: to
            }));

            return this;
        },
    };
}