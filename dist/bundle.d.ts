export declare class CustomScroll {
    static supportedEventTypes: string[];
    static checkEvent(type: any): void;
    constructor(element: HTMLElement, documentEl: any, DOMObserver: any);
    addListener(type: string, listener: Function): void;
    update(): void;
    private nodes;
    private document;
    private listeners;
    private thumbY;
    private contentHeight;
    private setNodes(el);
    private observeDOMMutation(DOMObserver);
    private processDOMMutation();
    private fixMarginRight();
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
