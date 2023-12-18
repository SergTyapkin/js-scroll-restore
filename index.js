// Make Vue plugin: vue.use(<imported ScrollRestore>, restorationHrefsAllowed, HTMLElement);
export default {
    install: (app, router, restorationHrefsAllowed, workingElement = document.body) => {
        app.config.globalProperties.$scroll = new ScrollRestore(app, router, restorationHrefsAllowed, workingElement);
    }
}

const HREF_SCROLLS_COUNT_IGNORE = 5;

export class ScrollRestore {
    restorationMap = {};
    restorationHrefsAllowed = undefined;
    workingElement = HTMLElement || window;
    prevHref = undefined;
    curHref = undefined;
    newHrefCount = 0;
    prevPageChangeDetectHref = undefined;

    constructor(app, router, restorationHrefsAllowed=undefined, workingElement = window) {
        this.$app = app;
        this.$router = router;
        this.workingElement = workingElement;
        this.restorationHrefsAllowed = restorationHrefsAllowed?.map((pageName) =>
          RegExp(this.$router.resolve(pageName).fullPath)
        ) || [];
        this.restorationMap = {};
        this.prevHref = this._getHref();
        this.curHref = this.prevHref;
        this.prevPageChangeDetectHref = this.prevHref;
        this._onScrollListener = () => {this._onScroll()};
        this.workingElement.addEventListener("scroll", this._onScrollListener);
    }
    destructor() {
        this.workingElement.removeEventListener("scroll", this._onScrollListener);
    }

    _getHref() {
        return location.pathname;
    }

    _onScroll() {
        const offsetTop = this.workingElement.scrollY || this.workingElement.scrollTop;
        const offsetLeft = this.workingElement.scrollX || this.workingElement.scrollLeft;
        const href = this._getHref();

        // console.log("CUR", href, this.prevHref, this.curHref, this.prevPageChangeDetectHref);
        if (href !== this.prevHref) {  // we're on new page
            if (href !== this.curHref || this.prevPageChangeDetectHref !== href) {  // fast change on another new page
                this.newHrefCount = 0;
                this.prevHref = this.curHref;
                this.curHref = href;
            } else {
                this.newHrefCount++; // we're just on new page
                // console.log(this.newHrefCount)
                if (this.newHrefCount > HREF_SCROLLS_COUNT_IGNORE) { // we're long time on new page
                    this.prevHref = href;
                    this.newHrefCount = 0;
                }
            }
        } else { // we're long time on this page
            if ((this.restorationHrefsAllowed === undefined) || (this.restorationHrefsAllowed.reduce((sum, cur) => sum || cur.test(href), false))) {
                // console.log("SAVE:", href, this.restorationMap[href]);
                this.restorationMap[href] = [offsetTop, offsetLeft];
            }
        }
        this.prevPageChangeDetectHref = href;
    }

    async restore() {
        const href = this._getHref();
        const savedScroll = this.restorationMap[href];
        console.log("RESTORE SCROLL:", href, this.restorationMap);
        if (savedScroll !== undefined) {
            if (this.workingElement === window) {
                this.workingElement.scrollTo(savedScroll[0], savedScroll[1]);
            } else {
                this.workingElement.scrollTop = savedScroll[0];
                this.workingElement.scrollLeft = savedScroll[1];
            }
        }
    }

    clearSavedPageScroll(href=undefined) {
        if (href === undefined)
            href = this._getHref();
        delete this.restorationMap[href];
    }

    clearAllSavedScroll() {
        this.restorationMap = {};
    }
}
