
import Jobs from 'pages/Jobs.vue'
const routes = [
  {
    path: '/',
    component: Jobs
    // component: () => import('pages/Jobs.vue')
  },
  {
    path: '/registration',
    component: () => import('pages/Registration.vue'),
    props: true
  },
  {
    path: '/jobpage/:jid',
    component: () => import('pages/JobPage.vue')
  },
  {
    path: '/companypage/:cid',
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
  {
    path: '/uploads',
    component: () => import('pages/Uploads.vue')
  },
  {
    path: '/feedback',
    component: () => import('pages/Feedback.vue')
  },
  {
    path: '/cv-editor',
    component: () => import('src/pages/AddCv.vue')
  },
  {
    path: '/cv-list',
    component: () => import('src/pages/CVs.vue')
  },
  // {
  //   path: '/cv-search',
  //   component: () => import('src/pages/CVSearch.vue')
  // },
  {
    path: '/cvs/:id',
    component: () => import('src/pages/CVDetail.vue')
  },
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
