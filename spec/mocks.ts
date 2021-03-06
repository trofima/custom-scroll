'use strict';

class ElementCoreMock {
    offsetHeight = 0;
    offsetTop = 0;
    scrollHeight = 0;
    children = [];

    constructor() {}

    addEventListener (name, callback) {
        if (!this.listeners[name])
            this.listeners[name] = [];

        this.listeners[name].push(callback);
    }

    removeEventListener (name, callback) {
        let callbackIndex = this.listeners[name].indexOf(callback);

        if (callbackIndex > -1)
            this.listeners[name].splice(callbackIndex, 1);
    }

    dispatchEvent(e) {
        this.listeners[e.type].forEach((listener) => listener(e));
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
        return Object.assign(this, {type: type}, props);
    }
}