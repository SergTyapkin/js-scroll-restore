# Scroll restore
![Static Badge](https://img.shields.io/badge/Vue.js-plugin-green)
![npm](https://img.shields.io/npm/dt/%40sergtyapkin%2Fscroll-restore)



----
Example on Vue framework:

```JS 
// index.ts

import { createApp } from 'vue';
import createVueRouter from './Router.js'
import { ScrollRestore } from "@sergtyapkin/scroll-restore";

import App from './App.vue';

const Router = createVueRouter(Store);
const app = createApp(App)
  .use(Router)
  .use(ScrollRestore, Router, [
    'events',
    'docs',
  ], document.body)
  .mount('#app');

// now ScrollRestore class available in any child component by:
// this.$scroll
```

```JS
// Docs.vue

<script>
export default {
  data() {
    return {
      // ... some data ... 
    }
  },

  async mounted() {
    // ... some logic ...
  
    this.$scroll.restore(); // !!!!!!!!! RESTORE !!!!!!!!!!
  },
}
</script>
```
