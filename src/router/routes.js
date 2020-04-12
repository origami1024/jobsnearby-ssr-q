

const routes = [
  {
    path: '/registration',
    component: () => import('pages/Registration.vue'),
    // props: true,
    props: true
  },
  {
    path: '/',
    component: () => import('pages/Jobs.vue')
  },
  {
    path: '/test1',
    component: () => import('pages/test1.vue')
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
