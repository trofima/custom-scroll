'use strict';

class ElementCoreMock {
    offsetHeight = 0;
    offsetTop = 0;
    scrollHeight = 0;
    children = [];

    constructor() {}

    addEventListener (name, callback) {
        this.listeners[name] = callback;
    }

    removeEventListener (name, callback) {
        if (callback === this.listeners[name])
            delete this.listeners[name];
    }

    dispatchEvent(e) {
        this.listeners[e.type](e);
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
        },
        
        getPropertyValue: (name) => {
            return this.style[name];
        }
    };

    private classes = [];
    private listeners = {};
}

export class ElementMock extends ElementCoreMock {
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

export class DOMObserverMock {
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

export class DocumentMock extends ElementCoreMock {
    constructor() {
        super();
    }
}

export class EventMock {
    constructor(type, props = {}) {
        return (<any>Object).assign({type: type}, props);
    }

    preventDefault() {}
}