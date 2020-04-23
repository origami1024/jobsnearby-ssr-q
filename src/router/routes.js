

const routes = [
  {
    path: '/',
    component: () => import('pages/Jobs.vue')
  },
  {
    path: '/registration',
    component: () => import('pages/Registration.vue'),
    props: true
  },
  {
    path: '/jobpage',
    component: () => import('pages/JobPage.vue')
  },
  {
    path: '/companypage',
    component: () => import('pages/CompanyPage.vue')
  },
  {
    path: '/subprofile',
    component: () => import('pages/SubProfile.vue')
  },
  {
    path: '/entprofile',
    component: () => import('pages/EntProfile.vue')
  },
  {
    path: '/addjob',
    component: () => import('pages/AddJob.vue')
  },
  // {
  //   path: '/uploads',
  //   component: () => import('pages/Uploads.vue')
  // },
  {
    path: '/feedback',
    component: () => import('pages/Feedback.vue')
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
