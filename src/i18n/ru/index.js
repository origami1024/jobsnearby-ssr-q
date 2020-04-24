// This is just an example,
// so you can safely delete all default props below

export default {
  hits: {
    job: 'Вакансия',
    company: 'Компания',
    remarks: 'Примечания',
    sent: 'Подано',
    seen: 'Просмотрено',
    closed: 'Закрыта',
    no: 'Нет',
    none: 'Не подано ни на одну должность. Чтобы подать резюме кликните "Подать резюме" на карточке вакансии',
  },
  jobsList: {
    zero: 'Нет ни одной вакансии',
    zerozero1: 'По запросу',
    zerozero2: 'ничего не найдено',
  },
  sub: {
    navCV: 'Резюме',
    navSentCVs: 'Поданные резюме',
    navPersonal: 'Личные данные',
    navSettings: 'Настройки',
    cvurlUploaded: 'Резюме загружено',
    cvurlNone: 'Резюме не загружено',
    loadCVHeader: 'Загрузить резюме',
    deleteCVBtn: 'Удалить резюме',
    name: 'Имя',
    surname: 'Фамилия',
    change: 'Изменить',
    email: 'Email',
    oldPW: 'Старый пароль',
    newPW: 'Новый пароль',
    dataChanged: 'Данные изменены',
    dataError: 'Ошибка при изменении данных',
    cvDeleted: 'Резюме удалено',
    cvTooBig: 'Резюме больше 100кб',
    wrongData: 'Неправильные данные',
    pwChanged: 'Пароль изменен'
  },
  upl: {
    header: 'Добавление нескольких вакансий',
    stepAdd: 'Добавить несколько вакансий через Excel',
    chooseFile: 'Выберите файл с вакансиями.',
    fileExample: 'Пример файла',
    stepPublish: 'Опубликовать вакансии',
    tdTilte: 'Название',
    tdSalMin: 'Зарп от',
    tdSalMax: 'Зарп до',
    tdCurr: 'Вал юта',
    tdAgeFrom: 'возр от',
    tdAgeTo: 'возр до',
    tdTimeFrom: 'время от',
    tdTimeTo: 'время до',
    tdSchedule: 'режим',
    tdLangs: 'Языки',
    tdEdu: 'Образ ование',
    tdExp: 'Стаж',
    tdCity: 'Город',
    tdJTyp: 'Тип занят ости',
    tdMore: 'Дополнительно',
    tdTel: 'Тел',
    tdMail: 'Почта',
    reset: 'Сбросить',
    publish: 'Опубликовать',
    stepFinish: 'Финиш',
    addMore: 'Добавить еще несколько вакансий через Excel',
    allPublishedHeader: 'Все опубликованные вакансии',
    authPlsMsg: 'Авторизируйтесь, для возможности загрузки вакансий',
    success1: 'Вакансии добавлены, они будут доступны для всех после проверки модератором',
    err1: 'Загрузка не удалась',
    errLimits1: 'Ошибка! Дневной лимит добавления вакансий(30) исчерпан. Добавлено ',
    errLimits2: ' вакансий из ',
    readyToUpload: 'готов к загрузке',
    getData: 'Загрузите данные',
    perm: 'постоянная',
    temp: 'временная',
  },
  fb: {
    topic: 'Тема',
    yourname: 'Ваше имя',
    hyphenMail: '* Email',
    mailValReq: 'Обязательное поле',
    mailValFormat: 'Некорректный формат адреса',
    textLabel: 'Пожелания',
    btnSend: 'Отправить',
    btnSendMore: 'Отправить еще',
    toMain: 'На главную',
    messageSuccess: 'Успешно отправлено',
    messageError: 'Ошибка на сервере',
    reqMail: 'Поле email обязательное',
    fbSuccess: 'Фидбэк отправлен',
    fbError: 'Ошибка на сервере',
  },
  companyPage: {
    categoriesHeader: 'Сферы деятельности компании',
    descHeader: 'Описание',
    publishedJobsCountLabel: 'Размещено вакансий: ',
    registrationDate: 'Зарегистрирована: ',
  },
  jobPage: {
    jobClosed: 'Вакансия закрыта',
    reason: 'причина',
    sendCV: 'Подать резюме',
    cvAlreadySent: 'Резюме уже подано',
    reqs: 'Требования',
    none: 'Не указаны',
    expNone: 'Без опыта.',
    exp1_3: 'Опыт: от 1 до 3 лет.',
    exp3_5: 'Опыт: от 3 до 5 лет.',
    exp5_: 'Опыт: от 5 лет.',
    ageLabel: 'Возраст:',
    from: 'от',
    to: 'до',
    years: 'лет',
    eduLabel: 'Образование:',
    langsLabel: 'Языки:',
    conds: 'Условия работы',
    salLabel: 'Оклад:',
    from2: 'с',
    schedule: 'График работы:',
    jTypeLabel: 'Вакансия',
    jTypePermanent: 'постоянная',
    jTypeTemporary: 'временная',
    desc: 'Описание',
    contacts: 'Контакты',
    publishedDate: 'Дата публикации:',
    salaryNone: 'по итогам собеседования',
    jobNotPublishedYet: 'Вакансия будет видна в общем списке после проверки модератором',
  },
  App: {
    login: 'Вход',
    logoutHint: 'Выйти',
    newJobHint: 'Создать вакансию',
    logoTooltip: 'Главная',
    myProfile: 'Мой кабинет',
    fbBtnLabel: 'Написать нам',
    jcats: [
      {label: "Не имеет значения", value: 0},
      {label: "Бух учет, финансы", value: 19},
      {label: "Гос служба", value: 1},
      {label: "Дизайн, полиграфия", value: 14},
      {label: "ИТ, Интернет", value: 4},
      {label: "Красота, фитнес, спорт", value: 12},
      {label: "Логистика, склад", value: 10},
      {label: "Маркетинг, реклама", value: 13},
      {label: "Медицина, Фармация, Ветеринария", value: 9},
      {label: "Недвижимость, риэлтерские услуги", value: 3},
      {label: "Нефть и Газ", value: 5},
      {label: "Образование, репетиторство", value: 6},
      {label: "Производство, агропром", value: 7},
      {label: "Рестораны, питание", value: 8},
      {label: "Строительство", value: 11},
      {label: "Торговля", value: 2},
      {label: "Транспорт, автосервис", value: 15},
      {label: "Туризм, гостиницы", value: 16},
      {label: "Юриспруденция", value: 17},
      {label: "HR, кадры", value: 18},
    ],
    expOpts: [
      {label: "Не имеет значения", value: -1},
      {label: "Без опыта", value: 0},
      {label: "от 1 до 3 лет", value: 2}, 
      {label: "от 3 до 5 лет", value: 4},
      {label: "от 5 лет", value: 6}
    ],
    jtypeOptions: [
      {label: "Постоянная", value: 'c'},
      {label: "Временная", value: 'v'}
    ],
    curOpts: [
      {label: 'm', value: 'm'},      
      {label: '$', value: '$'},
    ],
    cityList: ["Ашхабад", "Дашогуз", "Мары", "Туркменабад", "Туркменбаши"],
    firstCVNote: 'Сначала загрузите резюме!',
    onlyRegisteredCV: 'Подавать резюме могут <span style="color: red">зарегистрированные</span> пользователи',
    currencyDic: {
      '$': '$',
      'm': 'm',
    },
    doAuthForPublishing: 'Авторизируйтесь для возможности добавления вакансий',
    statusLoginNotDone: 'Вход не выполнен',
  },
  filters: {
    searchHint: 'Поиск по полям название, автор, город, основной текст',
    searchValSym: 'некорректная строка поиска',
    searchBtn: 'Найти',
    city: 'Город',
    sal: 'Зарплата',
    curr: 'Валюта',
    currDefault: [
      {label: "все", value: 'idc'},
      {label: "$", value: '$'},
      {label: "m", value: 'm'},],
    exp: 'Опыт работы',
    jcat: 'Профессия',
    applyBtn: 'Применить',
    expFilters: [
      {label: "Не имеет значения", value: 'idc'}, 
      {label: "Без опыта", value: '0'},
      {label: "от 1 до 3 лет", value: '1-3'}, 
      {label: "от 3 до 5 лет", value: '3-5'},
      {label: "от 5 лет", value: '5'}
    ],
    salFilters: [
      {label: "Не имеет значения", value: 'idc'}, 
      {label: "0 - 1000", value: '0-1'}, 
      {label: "1000 - 3000", value: '1-3'}, 
      {label: "от 3000", value: '3'},
    ],
    cities: ["Не имеет значения", "Ашхабад", "Дашогуз", "Мары", "Туркменабад", "Туркменбаши"],
  },
  jobs: {
    sortOpts: {
      new: 'По Дате',
      saldesc: 'По ЗП ↓',
      salasc: 'По ЗП ↑'
    },
    dateOpts: {
      mon: 'За Месяц',
      wee: 'За Неделю',
      day: 'За Сутки'
    },
    perpageOpts: {
      '25': '25 вакансий',
      '50': '50 вакансий',
      '100': '100 вакансий'
    },
    // sortOpts: [
    //   {label: 'По Дате', value: 'new'},
    //   {label: 'По ЗП ↓', value: 'saldesc'},
    //   {label: 'По ЗП ↑', value: 'salasc'}
    // ],
    // dateOpts: [
    //   {label: 'За Месяц', value: 'mon'},
    //   {label: 'За Неделю', value: 'wee'},
    //   {label: 'За Сутки', value: 'day'}
    // ],
    // perpageOpts: [
    //   {label: '25 вакансий', value: '25'},
    //   {label: '50 вакансий', value: '50'},
    //   {label: '100 вакансий', value: '100'}
    // ],
    
  },
  jc: {
    salaryNone: 'По итогам собеседования',
    expEmpty: 'Опыт не указан.',
    expNone: 'Без опыта.',
    exp1_3: 'Опыт: от 1 до 3 лет.',
    exp3_5: 'Опыт: от 3 до 5 лет.',
    exp5_: 'Опыт: от 5 лет.',
    sendCVLabel: 'Отправить резюме',
    tooltipSent: 'Отправлено',
    tooltipSeen: 'Просмотрено',
    tooltipNotseen: 'Не просмотрено',
    contactsLabel: 'Контакты работодателя',
    today: 'Сегодня',
    yesterday: 'Вчера',
    daysAgo: 'дня назад',
  },
  reg: {
    loginLabel: 'Вход',
    regLabel: 'Регистрация',
    loginEmailLabel: 'Email',
    loginPWLabel: 'Пароль',
    rmeLabel: 'Запомнить меня',
    frgtPWLabel: 'Забыл пароль?',
    enterBtn: 'Войти',
    radioSub: 'Специалист',
    radioCom: 'Компания',
    companyLabel: 'Компания',
    agencyLabel: 'Кадровое агенство',
    nameLabel: 'Имя',
    surnameLabel: 'Фамилия',
    regConfirmPWLabel: 'Повтор пароля',
    rulesStart: 'Я соглашаюсь с',
    rulesLink: 'правилами использования сервиса',
    rulesEnd: ', а также с передачей и обработкой моих данных в TEST.com. Я подтверждаю своё совершеннолетие и ответственность за размещение объявления.',
    regBtn: 'Регистрация',
    alreadyAuthedMessage: 'Авторизован',
    loginValiMail0: 'Введите email',
    loginValiMailFormat: 'Неправильный формат адреса',
    loginValiPW0: 'Введите пароль',
    loginValiPWFormat: 'Кол-во символов от 5 до 25',
    loginSuccess: 'Вход осуществлен',
    loginError1: 'Не существующий Email или не правильный пароль',
    loginError2: 'Такого пользователя не существует, либо неверный пароль',
    loginError3: 'Не удалось выполнить вход',
    regValiRules: 'Ознакомтесь с правилами',
    regValiPWC0: 'Подтвердите пароль',
    regValiPWCDiff: 'Пароли не совпадают',
    regValiPWChar: 'Минимум 1 английская буква',
    regValiPWMax: 'Максимум 25 символов',
    regValiPWMin: 'Минимум 6 символов',
    regValiPW0: 'Введите пароль',
    compValiFormat: 'Неправильный формат названия',
    compValiMax: 'Максимальная длина 60 символов',
    compValiMin: 'Минимальная длина 3 символа',
    compVali0: 'Введите название',
    surnameValiFormat: 'Неправильный формат фамилии',
    surnameValiMax: 'Максимальная длина 35 символов',
    surnameValiMin: 'Минимальная длина 3 символа',
    surnameVali0: 'Введите фамилию',
    nameValiFormat: 'Неправильный формат имени',
    nameValiMax: 'Максимальная длина 35 символов',
    nameValiMin: 'Минимальная длина 3 символа',
    nameVali0: 'Введите имя',
    regSuccess: 'На вашу почту выслано письмо с ссылкой для подтверждения регистрации.',
    regAllFields: 'Заполните все поля',
    regError1: 'Email или пароль не зарегестрированы',
    regError2: 'Такой email уже существует в базе данных',
    regError3: 'Регистрация не удалась, ошибки на сервере',
  },
  addJob: {
    pTypeNewLabel: 'Создать новую вакансию',
    pTypeEditLabel: 'Редактирование вакансии',
    titleLabel: 'Название вакансии',
    xlsBtn: 'Публикация вакансий XLS',
    titleValidationRequired: '* Обязательное поле',
    titleValidationMin: 'Минимум 2 символа',
    titleValidationMax: 'Максимум 75 символов',
    titleValidationSymbols: 'Используются запрещенные символы',
    salaryLabel: 'Зарплата',
    salaryMinPH: 'От',
    salaryValidationRange: 'От 0 до 99999',
    salaryMaxPH: 'До',
    salaryValidationEnter: 'Укажите зп',
    manat: 'манат',
    dollars: '$',
    salaryCB1Hint: 'По итогам собеседования',
    contactsLabel: 'Ваши контакты',
    emailPH: 'Email',
    emailValidationLength: 'Максимум 40 символов',
    emailValidationFormat: 'Неправильный формат',
    emailValidationEnter: 'Укажите Email или Телефон',
    telPH: 'Телефон',
    telValidationLengthMax: 'Максимум 15 символов',
    telValidationLengthMin: 'Минимум 5 символов',
    telValidationFormat: 'Неправильный формат',
    jcatLabel: 'Профессия',
    cityLabel: 'Город',
    cityValidationLength: 'Максимум 70 символов',
    cityValidationFormat: 'Только буквы',
    descLabel: 'Описание',
    descValidation2000: '(2000 символов максимум)',
    moreLabel: 'Дополнительно',
    expLabel: 'Опыт',
    jobTypeLabel: 'Тип занятости',
    ageLabel: 'Возраст',
    genericFrom: 'От',
    genericTo: 'До',
    genericEnterNumber: 'Введите число',
    genericFrom18: 'От 18',
    genericTooMuch: 'Слишком много',
    labelSchedule: 'График работы',
    genericWholeNumber:'Целое число',
    genericPositiveNumber: 'Положительное',
    generic24Max: '24 макс',
    schedulePH: 'Режим',
    scheduleValidationLengthMax: 'Максимум 10 символов',
    scheduleValidationFormat: 'Неправильный формат',
    eduLabel: 'Образование',
    eduValidationLengthMax: '20 символов макс',
    eduValidationFormat: 'Только буквы',
    eduTooltip: 'Например: высшее, среднее, высшее/среднее и т.д',
    langsLabel: 'Языки',
    sendJobBtnLabelNew: 'Разместить вакансию',
    sendJobBtnLabelUpdate: 'Отправить изменения',
    sendJobSuccess1: 'Вакансия ',
    sendJobSuccess2: ' добавлена. Она будет видна другим пользователям после проверки модератором',
    sendJobSuccess1x: 'Вакансия ',
    sendJobSuccess2x: ' успешно изменена',
    btnAddOneMore: 'Добавить еще одну',
    sendJobError1: 'Ошибка на сервере, вакансия не добавлена',
    unauthorized: 'Авторизируйтесь, для возможности загрузки вакансий',
    cityOptions: ["Ашхабад", "Дашогуз", "Мары", "Туркменабад", "Туркменбаши"],
    langOptions: ["Туркменский", "Русский", "Английский", "Китайский", "Немецкий", "Французкий"],
    scheduleList: ["5/2", "6/1", "2/2", "3/2", "3/1", "15/15"],
    currDefault: {label: 'm', value: 'm'},
    sendJobErrorLimit: 'Ошибка! Дневной лимит добавления вакансий(30) исчерпан. Вакансия НЕ добавлена',
  },
  entProfile: {
    navPublishedLabel: 'Вакансии',
    navResponsesLabel: 'Отклики',
    navAboutLabel: 'О компании',
    navSettingsLabel: 'Настройки',
    publishedHeader: 'Опубликованные вакансии',
    cvSent: 'Подано:',
    cvSeen: 'Просмотрено:',
    cvNotSeen: 'Просмотрено: нет',
    cname: 'Название компании',
    dragLogo: 'Логотип',
    sitePH: 'Сайт',
    catPH: 'Сфера деятельности',
    descPH: 'Описание',
    sendChanges: 'Отправить изменения',
    settingsLabel: 'Компания',
    emailLabel: 'Email',
    oldPWLabel: 'Старый пароль',
    newPWLabel: 'Новый пароль',
    changeSettingsBtn: 'Изменить',
    companyDomains: ["Автомобильный бизнес", "Гостиницы, рестораны, общепит, кейтеринг", "Государственные организации", "Добывающая отрасль", "ЖКХ", "Информационные технологии, системная интеграция, интернет", "Искусство, культура", "Лесная промышленность, деревообработка", "Медицина, фармацевтика, аптеки", "Металлургия, металлообработка", "Нефть и газ", "Образовательные учреждения", "Общественная деятельность, партии, благотворительность, НКО", "Перевозки, логистика, склад, ВЭД", "Продукты питания", "Промышленное оборудование, техника, станки и комплектующие", "Розничная торговля", "СМИ, маркетинг, реклама, BTL, PR, дизайн", "Сельское хозяйство", "Строительство, эксплуатация, проектирование", "Недвижимость", "Телекоммуникации, связь", "Товары народного потребления (непищевые)", "Тяжелое машиностроение", "Управление многопрофильными активами", "Услуги для бизнеса", "Услуги для населения", "Финансовый сектор", "Химическое производство, удобрения", "Электроника, приборостроение, бытовая техника, компьютеры и оргтехника", "Энергетика"],
    pwChanged: 'Пароль изменен',
    pwWrongData: 'Неправильные данные',
    dataChanged: 'Данные изменены',
    dataError: 'Ошибка',
    picLoaded: 'Изображение загружено',
    picTooBig: 'Картинка больше 400кб',
    picUploaded: 'Картинка установлена'
  },
  jobsStats: {
    title: 'Название',
    views: 'Просм',
    uniqViews: 'Уник',
    published: 'Опублик',
    change: 'Изменить',
    close: 'Закрыть',
    delete: 'Удалить',
    closed: 'Закрыта',
    none: 'Нет ни одной вакансии',
    publishedHint: 'Публикуется после проверки модератором',
    yes: 'Да',
    no: 'Нет',
    status: 'Статус',
    published: 'Опубликована',
    notpublished: 'Не опубликована',
    editHint: 'Редактировать',
    reopenHint: 'Открыть',
    resendHint: 'На проверку модератору для открытия',
    closeHint: 'Закрыть',
    deleteHint: 'Удалить',
  }
}
