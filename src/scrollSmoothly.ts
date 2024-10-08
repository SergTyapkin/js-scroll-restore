export function getScrollTopLeft(element: HTMLElement | Window): {top: number, left: number} {
  let scrollTop: number;
  let scrollLeft: number;
  if (element instanceof Window) {
    scrollTop = element.scrollY;
    scrollLeft = element.scrollX;
  } else {
    scrollTop = element.scrollTop;
    scrollLeft = element.scrollLeft;
  }
  return {top: scrollTop, left: scrollLeft};
}

export function setScrollTopLeft(element: HTMLElement | Window, scrollTop?: number, scrollLeft?: number) {
  const {top, left} = getScrollTopLeft(element);

  if (element instanceof Window) {
    element.scrollTo(scrollTop || top, scrollLeft || left);
  } else {
    element.scrollTop = scrollTop || top;
    element.scrollLeft = scrollLeft || left;
  }
}


let scrollTopPrev = Infinity;
let stopScroll: boolean | undefined = undefined;
export function scrollSmoothly(element: HTMLElement |  Window, scrollVal: number, start: boolean = true, smoothness: number = 8) {
  if (start)
    stopScroll = false;

  const {top: scrollTop} = getScrollTopLeft(element);
  const newScrollTop = scrollTop + (scrollVal - scrollTop) / smoothness;
  if ((Math.abs(scrollTopPrev - scrollVal) <= Math.abs(scrollTop - scrollVal)) || (stopScroll === true)) {
    // User scroll in different side while auto scrolling => stop scrolling
    scrollTopPrev = Infinity;
    stopScroll = false;
    return;
  } else if (Math.abs(newScrollTop - scrollVal) <= Math.abs(newScrollTop - scrollTop)) {
    // End of auto scrolling
    setScrollTopLeft(element, scrollVal);
    scrollTopPrev = Infinity;
    stopScroll = false;
    return;
  } else {
    // Auto scrolling in process
    window.requestAnimationFrame(() => scrollSmoothly(element, scrollVal, false, smoothness));
    setScrollTopLeft(element, newScrollTop);
  }
  scrollTopPrev = scrollTop;
}

export function scrollSmoothlyStop() {
  stopScroll = true;
}
