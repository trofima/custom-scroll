'use strict';

interface MutationObserverClass {
    new (callback:MutationCallback):MutationObserver;
}

export class CustomScroll {
    //TODO: set to body cursor: pointer while draging thumb
    //TODO: on window resize
    //TODO: display scroll handle on scrolling (if window is not focused, animation doesn't show the handle)
    //TODO: on bar click scroll ?

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

    private listeners = {
        scroll: [],
        change: [],
    };

    private thumb = {
        y: 0,
    };

    constructor(
        element:HTMLElement,
        // documentEl:Document,
        DOMObserver
    ) {
        // this.document.el = documentEl;
        this.setNodes(element);
        this.observeDOMMutation(DOMObserver);
        // this.addEventListeners();
    }

    addListener(type:string, listener:Function) {
        this.listeners[type].push(listener);
    }

    private setNodes(el) {
        this.nodes.el = el;
        this.nodes.shifted = el.querySelector('.shifted');
        this.nodes.content = this.nodes.shifted.querySelector('.content');
        this.nodes.bar = el.querySelector('.bar');
        this.nodes.thumb = this.nodes.bar.querySelector('.thumb');
    }

    private observeDOMMutation(DOMObserver) {
        let domObserver = new DOMObserver(() => this.update());

        domObserver.observe(this.nodes.content, {
            childList: true,
            attributes: true,
            subtree: true,
        });
    }

    private update() {
        if (this.nodes.shifted.scrollHeight > this.nodes.el.offsetHeight) {
            this.show();
        } else {
            this.hide();
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

    private invokeListenersFor(type) {
        let shifted = this.nodes.shifted;

        this.listeners[type].forEach((listener) => listener({
            offsetHeight: shifted.offsetHeight,
            scrollHeight: shifted.scrollHeight,
            scrollTop: shifted.scrollTop,
        }));
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

    private startThumbDragging(e) {
        this.nodes.el.classList.add('thumb-drugging');
        this.thumb.y = e.screenY;
        this.addDocumentEventListener('mousemove', (e) => this.dragThumb(e));
        this.addDocumentEventListener('mouseup', (e) => this.finishThumbDragging(e));
        e.preventDefault();
    }

    private addDocumentEventListener(name, callback) {
        this.document.listeners.push({
            name: name,
            callback: callback,
        });

        this.document.el.addEventListener(name, callback);
    }

    private dragThumb(e) {
        let deltaY = (e.screenY - this.thumb.y)
            * this.nodes.shifted.scrollHeight / this.nodes.bar.offsetHeight;

        this.thumb.y = e.screenY;
        this.nodes.shifted.scrollTop += deltaY;
        e.preventDefault();
    }

    private finishThumbDragging(e) {
        this.nodes.el.classList.remove('thumb-drugging');

        this.document.listeners.forEach(
            (listener) =>
                this.document
                    .el.removeEventListener(listener.name, listener.callback)
        );

        e.preventDefault();
    }
}