'use strict';

interface MutationObserverClass {
    new (callback:MutationCallback):MutationObserver;
}

export class CustomScroll {
    //TODO: set to body cursor: pointer while draging thumb
    //TODO: on window resize
    //TODO: display scroll handle on scrolling (if window is not focused, animation doesn't show the handle)
    //TODO: on bar click scroll ?

    static supportedEventTypes = ['scroll', 'change'];

    static checkEvent(type) {
        function removeSpaces(strings, ...values) {
            let output = '';

            for (let i = 0; i < values.length; i++)
                output += strings[i] + values[i];

            output += strings[values.length];

            return output
                .split(/(?:\r\n|\n|\r)/)
                .map((line) => line.replace(/^\s+/gm, ''))
                .join('\n');
        }

        if (this.supportedEventTypes.indexOf(type) === -1)
            throw new TypeError(removeSpaces`
							Event type '${type}' is not supported.
							Supported events are: ${this.supportedEventTypes.join(', ')}.
						`);
    }

    constructor(
        element:HTMLElement,
        documentEl,//:Document,
        DOMObserver//:MutationObserverClass
    ) {
        CustomScroll.supportedEventTypes.forEach((type) => this.listeners[type] = []);
        this.document.el = documentEl;
        this.setNodes(element);
        this.observeDOMMutation(DOMObserver);
        this.addEventListeners();
    }

    addListener(type:string, listener:Function) {
        CustomScroll.checkEvent(type);

        if (this.listeners[type])
            this.listeners[type].push(listener);
    }

    update() {
        this.fixMarginRight();

        if (this.nodes.shifted.scrollHeight > this.nodes.el.offsetHeight)
            this.show();
        else
            this.hide();
    }

    private nodes = {
        el: null,
        shifted: null,
        content: null,
        bar: null,
        thumb: null,
    };

    private document = {
        el: null,
        listeners: []
    };

    private listeners = {};
    private thumbY = 0;
    private contentHeight = 0;

    private setNodes(el) {
        this.nodes.el = el;
        this.nodes.shifted = el.querySelector('.shifted');
        this.nodes.content = this.nodes.shifted.querySelector('.content');
        this.nodes.bar = el.querySelector('.bar');
        this.nodes.thumb = this.nodes.bar.querySelector('.thumb');
    }

    private observeDOMMutation(DOMObserver) {
        let domObserver = new DOMObserver(() => this.processDOMMutation());

        domObserver.observe(this.nodes.content, {
            childList: true,
            attributes: true,
            subtree: true,
        });
    }

    private processDOMMutation() {
        let currentContentHeight = this.nodes.content.offsetHeight;

        if (this.contentHeight !== currentContentHeight) {
            this.contentHeight = currentContentHeight;
            this.update();
        }
    }

    private fixMarginRight() {
        let shifted = this.nodes.shifted;
        let scrollBarWidth = shifted.offsetWidth - shifted.clientWidth;

        if (scrollBarWidth) {
            shifted.style.setProperty('margin-right', -scrollBarWidth + 'px');
            this.nodes.content.style.setProperty('margin-right', 0 + 'px');
        }
    }

    private hide() {
        this.nodes.el.classList.remove('visible');
    }

    private show() {
        let thumbHeight = Math.pow(this.nodes.el.offsetHeight, 2)
            / this.nodes.shifted.scrollHeight + 'px';

        this.nodes.el.classList.add('visible');
        this.nodes.thumb.style.setProperty('height', thumbHeight);
        this.invokeListenersFor('change');
    }

    private addEventListeners() {
        this.nodes.shifted.addEventListener('scroll', () => {
            this.moveThumb();
            this.invokeListenersFor('scroll');
        });

        this.nodes
            .thumb.addEventListener('mousedown', (e) => this.startThumbDragging(e));
    }

    private moveThumb() {
        let newTop = this.nodes.bar.offsetHeight * this.nodes.shifted.scrollTop
            / this.nodes.shifted.scrollHeight;

        this.nodes.thumb.style.setProperty('top', newTop + 'px');
    }

    private invokeListenersFor(type) {
        let shifted = this.nodes.shifted;

        this.listeners[type].forEach((listener) => listener({
            offsetHeight: shifted.offsetHeight,
            scrollHeight: shifted.scrollHeight,
            scrollTop: shifted.scrollTop,
        }));
    }

    private startThumbDragging(e) {
        this.nodes.el.classList.add('thumb-dragging');
        this.thumbY = e.screenY;
        this.addDocumentEventListener('mousemove', (e) => this.dragThumb(e));
        this.addDocumentEventListener('mouseup', (e) => this.finishThumbDragging(e));
        // e.preventDefault();
    }

    private addDocumentEventListener(name, callback) {
        this.document.listeners.push({
            name: name,
            callback: callback,
        });

        this.document.el.addEventListener(name, callback);
    }

    private dragThumb(e) {
        let deltaY = (e.screenY - this.thumbY)
            * this.nodes.shifted.scrollHeight / this.nodes.bar.offsetHeight;

        this.nodes.shifted.scrollTop += deltaY;
        // e.preventDefault();
    }

    private finishThumbDragging(e) {
        this.nodes.el.classList.remove('thumb-dragging');

        this.document.listeners.forEach(
            (listener) =>
                this.document
                    .el.removeEventListener(listener.name, listener.callback)
        );

        // e.preventDefault();
    }
}