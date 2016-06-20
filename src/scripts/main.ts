'use strict';

interface MutationObserverClass {
    new (callback:MutationCallback):MutationObserver;
}

export class CustomScroll {
    //TODO: fix infinite scroll
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

    private scroll = {
        thumbY: 0,
        callbacks: [],
    };

    constructor(
        element:HTMLElement,
        // documentEl:Document,
        DOMObserver
    ) {
        // this.document.el = documentEl;
        
        // console.log(element.offsetHeight, element);

        this.setNodes(element);
        this.observeDOMMutation(DOMObserver);
        // this.addEventListeners();
    }

    addScrollListener(callback) {
        this.scroll.callbacks.push(callback);
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
            subtree: true
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
    }

    private addEventListeners() {
        this.nodes.shifted.addEventListener('scroll', () => {
            this.moveThumb();
            this.executeScrollCallbacks();
        });
        this.nodes
            .thumb.addEventListener('mousedown', (e) => this.startThumbDragging(e));
    }

    private moveThumb() {
        let newTop = this.nodes.bar.offsetHeight * this.nodes.shifted.scrollTop
            / this.nodes.shifted.scrollHeight;

        this.nodes.thumb.style.setProperty('top', newTop + 'px');
    }

    private executeScrollCallbacks() {
        let shifted = this.nodes.shifted;

        this.scroll.callbacks.forEach((callback) => callback({
            offsetHeight: shifted.offsetHeight,
            scrollHeight: shifted.scrollHeight,
            scrollTop: shifted.scrollTop,
        }));
    }

    private startThumbDragging(e) {
        this.nodes.el.classList.add('thumb-drugging');
        this.scroll.thumbY = e.screenY;
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
        let deltaY = (e.screenY - this.scroll.thumbY)
            * this.nodes.shifted.scrollHeight / this.nodes.bar.offsetHeight;

        this.scroll.thumbY = e.screenY;
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