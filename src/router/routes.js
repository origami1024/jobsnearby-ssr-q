
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
    path: '/cv/:action',
    component: () => import('src/pages/AddCv.vue')
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
