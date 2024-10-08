// Make Vue plugin: vue.use(<imported ScrollRestore>, restorationHrefsAllowed, HTMLElement);
import {type Router} from "vue-router"
import {getScrollTopLeft, scrollSmoothly, scrollSmoothlyStop, setScrollTopLeft} from "./scrollSmoothly";

export default {
  install: (app: any, router: Router, restorationHrefsAllowed?: string[], workingElement?: HTMLElement | Window) => {
    app.config.globalProperties.$scroll = new ScrollRestore(app, router, restorationHrefsAllowed, workingElement);
  }
}

const HREF_SCROLLS_COUNT_IGNORE = 5;

export class ScrollRestore {
  restorationMap: {
    [index: string]: [number, number]
  }
  restorationHrefsAllowed: RegExp[]
  workingElement: HTMLElement | Window
  prevHref: string
  curHref: string
  prevPageChangeDetectHref: string
  newHrefCount: number
  $app: any
  $router: Router
  _onScrollListener: () => void

  constructor(app: any, router: Router, restorationHrefsAllowed?: string[], workingElement: HTMLElement | Window = window) {
    this.$app = app;
    this.$router = router;
    this.workingElement = workingElement;
    this.restorationHrefsAllowed = [];
    if (restorationHrefsAllowed) {
      this.restorationHrefsAllowed = restorationHrefsAllowed?.map((pageHref) =>
        RegExp(this.$router.resolve(pageHref).fullPath)
      );
    }
    this.restorationMap = {};
    this.prevHref = this._getHref();
    this.curHref = this.prevHref;
    this.newHrefCount = 0;
    this.prevPageChangeDetectHref = this.prevHref;
    this._onScrollListener = () => {
      this._onScroll();
    };
    this.workingElement.addEventListener("scroll", this._onScrollListener);
    this.$router.afterEach(async (to, from) => {
      const isInDenyList = this.restorationHrefsAllowed.reduce((sum, cur) => sum || cur.test(to.fullPath), false);
      if (!isInDenyList || (from.name === to.name)) {
        requestAnimationFrame(() => {
          scrollSmoothly(this.workingElement, 0);
        });
      } else {
        scrollSmoothlyStop();
      }
    });
  }

  destructor() {
    this.workingElement.removeEventListener("scroll", this._onScrollListener);
  }

  _getHref(): string {
    return location.pathname;
  }

  _onScroll() {
    const {top: offsetTop, left: offsetLeft} = getScrollTopLeft(this.workingElement);
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

  restore() {
    const href = this._getHref();
    const savedScroll = this.restorationMap[href];
    console.log("RESTORE SCROLL:", href, this.restorationMap);
    setScrollTopLeft(this.workingElement, savedScroll[0], savedScroll[1])
  }

  clearSavedPageScroll(href?: string) {
    if (href === undefined)
      href = this._getHref();
    delete this.restorationMap[href];
  }

  clearAllSavedScroll() {
    this.restorationMap = {};
  }
}

export {scrollSmoothly, scrollSmoothlyStop};
