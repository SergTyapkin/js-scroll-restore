import {type ScrollRestore} from "./index";

declare module 'vue' {

  interface ComponentCustomProperties {
    $scroll: ScrollRestore,
  }
}
