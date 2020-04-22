exports.head = `<!DOCTYPE html>
<html lang="en"><head><style>
section {
  width: 100%;
}
.detailed__line {
  display: flex;
}
</style></head><body>`
exports.end  = `</body></html>`
exports.footer = `<footer></footer>`
exports.foot = exports.footer + exports.end
exports.demo = `<h1>somethings</h1>`
exports.headbody = `<head><style>
  .detailed__line {
    display: flex;
  }
</style></head><body>`


exports.noau = exports.headbody + `<div>
    Ошибка 505001, страницы не существует, бубубу
  </div>
` + exports.end
exports.cplink = () => {
  return (
    `<a href="/cp.json">&lt;Админка</a>`
  )
}
exports.navbar = links => {
  return (
    `<nav>
      <ul>
        ${links.map(link => `<li><a href="${link.href}">${link.title}</a></li>`).join("")}
      </ul>
    </nav>`
  )
}
exports.jobsList = () => {
  return `
    <section>
      <ul>
        
      </ul>
    </section>
    `
}
let currencydic = {
  '$': '$',
  'm': 'манат',
  'р': 'руб',
  'e': 'евро'
}
let sexdic = {
  'w': '<li>Женщина</li>',
  'm': '<li>Мужчина</li>',
}
exports.jobinfo1 = (job) => {
  
  let currency = currencydic[job.currency]
  let descArr
  if (job.description) {
    descArr = job.description.split(' / ')
    descArr = '<li>' + descArr.join('</li><li>') + '</li>'
  } else descArr = ''
  let gender = sexdic[job.sex] || ''
  let salary_subtitle = job.salary_max ? `<p style="font-size: 20px">${job.salary_max} ${currency}</p>` : ''
  let edu = job.edu ? `<li>${job.edu}</li>` : ''
  let langs = job.langs.length > 0 ? `<li>${job.langs.join(', ')}</li>` : ''
  let exp = job.experience > 0 ? `<li>Минимальный стаж ${job.experience} лет</li>` : '<li>Без опыта</li>'
  let salary_deriv
  
  if (job.salary_min < 1) {
    if (job.salary_max < 1) {
      salary_deriv = 'по итогам собеседования'
    } else salary_deriv = job.salary_max
  } else {
    if (job.salary_min < job.salary_max) {
      salary_deriv = `${job.salary_min} - ${job.salary_max}`
    } else
    if (job.salary_min = job.salary_max) {
      salary_deriv = `${job.salary_max}`
    } else salary_deriv = `${job.salary_max}`
  }
  
  return `<!DOCTYPE html>
  <html lang="en"><head>
  <link href="https://fonts.googleapis.com/css?family=Nunito|Varela+Round&display=swap" rel="stylesheet">
  <style>
  * {
    margin: 0;
    font-family: 'Montserrat', sans-serif;
  }
  .detailed__main1{
    width: 80%;
    max-width: 850px;
    background-color: white;
    padding: 0 10px;
    padding-top: 10px;
    min-height: 100vh;
    box-sizing: border-box;
    box-shadow: 0 0 2px 3px #eee;
  }
  section {
    margin-bottom: 30px;
  }
  .detailed__button {
    background-color: #B4E873;
    padding: 5px;
    border: 0;
    font-size: 20px;
    cursor: pointer;
  }
  .detailed__button:hover {
    color: white;
  }
  .detailed__author-link{
    color: #0CA0DF;
  }
  .detailed__line {
    display: flex;
    justify-content: space-between;
  }
  .detailed__col{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .detailed__logo{
    width: 100px;
    height: 60px;
    background-color: coral;
  }
  .detailed__header{
    color: #2242B4;
    margin-bottom: 10px;
  }
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #eee;
  }
  </style></head><body>
    <main class="detailed__main">
      <section class="detailed__line">
        <div class="detailed__col">
          <h1>${job.title}</h1>
          ${salary_subtitle}
        </div>
        <div class="detailed__logo">Лого</div>
      </section>
      <section>
        <p><a href="#" class="detailed__author-link">${job.author}</a></p>
        <p>${job.city}</p>
      </section>
      <section>
        <button class="detailed__button">Откликнуться</button>
      </section>
      <section>
        <h4 class="detailed__header">Обязанности</h4>
        <ul>
          ${descArr ? descArr : '-'}
        </ul>
      </section>
      <section>
        <h4 class="detailed__header">Требования</h4>
        <ul>
          ${gender}
          ${(job.age1 > 0 && job.age2 > 0) ? `<li>Возраст: ${(job.age1 && job.age1 > 0)? 'от ' + job.age1 : ''} ${(job.age2 && job.age2 > 0) ? 'до ' + job.age2 + ' лет': ''} ${(job.age1 && !job.age2) ? ' лет' : ''}</li>` : ''}
          ${langs}
          ${edu}
          ${exp}
        </ul>
      </section>
      <section>
        <h4 class="detailed__header">Условия работы</h4>
        <ul>
          <li>Оклад ${salary_deriv} ${currency}</li>
          ${(job.worktime1 > 0 && job.worktime2 > 0) ? `<li>График ${job.worktime1} - ${job.worktime2}</li>` : ''}
        </ul>
      </section>
      <section>
        <h4 class="detailed__header">Контакты</h4>
        <ul>
          <li>тел.. .. .....</li>
          <li>мейл@домен.домен</li>
        </ul>
      </section>
      <section>
        <p>Всех просмотров: ${job.hits_all || 1}</p>
        <p>Уникальных просмотров: ${job.hits_uniq || 1}</p>
      </section>
    <main>
  </body></html>
  `
}