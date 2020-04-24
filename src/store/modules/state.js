export default function () {
  return {
    addJob: {
      newJobsPageType: 'new',
      jobEditedObj: {},
      sent: 'none'
    },
    user: {
      identity: 'Гость',//previously 'user', or is a mail
      role: 'guest',
      user_id: -1,
      username: '',
      surname: '',
      company: '',
      isagency: false,
      insearch: false,
      cvurl: '',
      new_jobs_count_today: 0,
      ownJobs: [],
      ownCVs: []
    },
    cabout: {
      company: '',
      logo_url: '',
      domains: [], //3max
      website: '',
      full_description: ''
    },
    authStatus: 'Вход не выполнен',//previously status in the app - maybe not needed now
    regState: 'login',//текущий таб регистрации
    jobslist: [],
    jobs: {
      jobsFullcount: 0,
      perpage: 25,
      page_current: 1
    },
    uStats: { //user stats - статистика по зп справа на главной
      salMin: "",
      salAvg: "",
      salMax: "",
      tops: [["","",""],["","",""],["","",""],["","",""],["","",""],["","",""]]
    },
    jFilters: {
      query: '',

      city: '',
      jcat: {label: "", value: 0},
      salary: {label: "", value: 'idc'},
      exp: {label: "", value: 'idc'}, 
      currency: {label: "", value: 'idc'},
      
      txt: '',

      timerange: 'mon',
      sort: 'new',
      perpage: '25'
      //searchFilter what?
    },
    jobDetails: {}, //Главный объект JobPage
    cdata: { //Главный объект CompanyPage
      company: '',
      logo_url: '',
      domains: [], //3max
      website: '',
      full_description: '',
      time_created: '',
      jobs_count: 0
    },
  }
}
