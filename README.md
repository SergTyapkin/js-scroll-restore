# Reconnecting WebSocket
![Static Badge](https://img.shields.io/badge/Vue.js-plugin-green)
![npm](https://img.shields.io/npm/dt/%40sergtyapkin%2Fscroll-restore)



----
Example on Vue framework:

```JS 
// index.js

import { createApp } from 'vue';
import createVueRouter from './Router.js'
import ScrollRestore from "@sergtyapkin/scroll-restore";

import App from './App.vue';

const Router = createVueRouter(Store);
const app = createApp(App)
  .use(Router)
  .use(ScrollRestore, Router, [
    'events',
    'achievements',
    'ratings',
    'doc',
    'docs',
  ], document.body)
  .mount('#app');

// now ScrollRestore class available in any child component by:
// this.$scroll
```

```JS
// Router.js

import { createRouter, createWebHistory } from 'vue-router'

import EventsList from "./views/EventsList.vue";
import Docs from "./views/Docs.vue";
import Profile from "./views/Profile.vue";

import Page404 from '/src/views/Page404.vue'

import {nextTick} from "vue";


export default function createVueRouter(Store) {
    this.scrollToTopDenyHrefs = [];
  
    const routes = [
        {path: BASE_URL_PATH + '/events', name: 'events', component: EventsList},
        {path: BASE_URL_PATH + '/docs', name: 'docs', component: Docs},
        {path: BASE_URL_PATH + '/profile', name: 'profile', component: Profile},

        {path: BASE_URL_PATH + '/:catchAll(.*)', component: Page404},
    ]

    const Router = createRouter({
        history: createWebHistory(),
        routes: routes,
    });

    
    Router.afterEach(async (to, from, next) => {
        const inDenyList = this.scrollToTopDenyHrefs.reduce((sum, cur) => sum || cur.test(to.fullPath), false);
        if (!inDenyList || (from.name === to.name)) {
            await nextTick();
            document.body.scrollTo(0, {behavior: "smooth"});
        } else {
            // stop scroll
        }
    });

    return Router;
}
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
