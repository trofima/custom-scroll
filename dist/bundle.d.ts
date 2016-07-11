export declare class CustomScroll {
    static supportedEventTypes: string[];
    static checkEvent(type: any): void;
    constructor(element: HTMLElement, DOMObserver: any);
    addListener(type: string, listener: Function): void;
    private nodes;
    private document;
    private listeners;
    private thumb;
    private setNodes(el);
    private observeDOMMutation(DOMObserver);
    private update();
    private hide();
    private show();
    private addEventListeners();
    private moveThumb();
    private invokeListenersFor(type);
    private startThumbDragging(e);
    private addDocumentEventListener(name, callback);
    private dragThumb(e);
    private finishThumbDragging(e);
}
