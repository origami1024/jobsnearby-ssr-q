const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://postgres:123456@localhost:5433/jobsnearby`
})


const bcrypt = require('bcryptjs')



// let nodeMailer = require('nodemailer')
const SupremeValidator = require('./../serverutils').SupremeValidator
const pageParts = require('./../serverutils').pageParts

//Добавить лог
async function addLog (action, body, author_id, author_mail) {
  //time, action, body, author_id, author_name
  let que = `
    INSERT INTO "logs" (time, action, body, author_id, author_mail) VALUES
    (NOW(), $1, $2, $3, $4)`
  let params = [action, body, author_id, author_mail]
  let result1 = await pool.query(que, params).catch(error => {
    console.log('cp addLog err: ', error)
    return undefined
  })
  return Boolean(result1)
}

async function cpLoginEndpoint(req, res) {
  
  let mail = req.body.uname.toLowerCase()
  let pw = req.body.psw
  let rememberme = req.body.remember
  if (rememberme === 'on' || rememberme == 'true') rememberme = true
  if (rememberme != true) rememberme = false
  if (SupremeValidator.isValidEmail(mail) && SupremeValidator.isValidPW(pw)) {
    
    let adminData = await getAdminHash(mail).catch(error => {
      res.send('step2')
      return undefined
    })
    if (!adminData) {
      res.send('<html><script>window.location.href = "/cplogin.json?e=err1"</script></html>')
      return false
    }
    console.log('23')
    let authed = bcrypt.compareSync(pw, adminData)
    console.log('cp54: ', authed)

    if (authed) {
      let jwtoken = SupremeValidator.generateJSONWebToken(mail)
      let laststage = await tryInsertAdminCoo(mail, jwtoken).catch(error => {
        res.send('step5')
        return undefined
      })
      //after this not checked
      if (laststage === undefined) return false
      console.log('success, sending')

      if (rememberme) {
        res.cookie('sessioa', jwtoken, {expires: new Date(Date.now() + 590013000)})
        res.cookie('user2', mail, {expires: new Date(Date.now() + 590013000)})
      } else {
        res.cookie('sessioa', jwtoken)
        res.cookie('user2', mail)
      }
      //res.send(JSON.stringify({'coo': jwtoken}))
      res.send(`<html><script>window.location.href = "/cp.json"</script></html>`)
    } else {res.send(`<html><script>window.location.href = "/cplogin.json?e=err1"</script></html>`)}
    //finish this!!!
  } else {res.send(`<html><script>window.location.href = "/cplogin.json?e=err1"</script></html>`)}
  
}

async function adminLogin(req, res) {
  let body = `
    <form action="/cploginep.json" method="post" style="width: 220px; margin: 0 auto; margin-top:25vh">
      <div class="container" style="display: flex; flex-direction: column;">
        <label for="uname"><b>Username</b></label>
        <input type="text" placeholder="Enter Username" name="uname" required>

        <label for="psw"><b>Password</b></label>
        <input type="password" placeholder="Enter Password" name="psw" required>

        <button type="submit">Login</button>
        <label>
          <input type="checkbox" checked="checked" name="remember"> Remember me
        </label>
      </div>
      ${req.query.e == 'err1' ? '<div style="color:red">Ошибка авторизации</div>' : ''}
    </form>
    

  `
  let loginPage = pageParts.head + body + pageParts.footer
  res.send(loginPage)
}

async function adminPanel(req, res) {
  //cookie verify structure
  if (req.cookies && req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    //auth check
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      //res.send('step2')
      return undefined
    })
    console.log(auth) //depending on rights, give different pages later
    if (auth) {
      
      let mail = req.cookies.user2

      let stts = await adminStats().catch(error => {
        return undefined
      })
      let sttsbody = ''
      if (stts) {
        sttsbody = `
          <div>
            <h3 style="margin: 0; margin-bottom: 10px">Основная статистика</h3>
            <p>Кол-во вакансий: <b>${stts.jcount}</b></p>
            <p>Кол-во пользователей: <b>${Number(stts.uscount) + Number(stts.uccount)}</b></p>
            <p>Из них соискателей: <b>${stts.uscount}</b></p>
            <p>Из них компаний: <b>${stts.uccount}</b></p>
            <p>Кол-во подач резюме: <b>${stts.hcount}</b></p>
            <p>Новые вакансии сегодня: <b>${stts.opened_today_count}</b></p>
            <p>Новые вакансии за неделю: <b>${stts.opened_this_week_count}</b></p>
          <div>
        `
      }
      let sttsDay = await adminDayStats().catch(error => {
        return undefined
      })
      if (sttsDay) {
        sttsDaybody = `
          <div class="charts">
            <h3 style="margin: 0; margin-bottom: 10px">Новые вакансии по дням за последние два месяца</h3>
            <svg id="jobs_per_day_chart" width="800" height="300"></svg>
          </div>
          <style>
            .bar {
              fill: steelblue;
            },
          </style>
          <script src="https://d3js.org/d3.v5.min.js"></script> 
          
          <script>
            var data = ${JSON.stringify(sttsDay.map(val=>{val.day = val.day.substring(5);return val}))}//.map(val=>{val.day = String(val.day).split(' 2020')[0].split(' ').slice(1).join(' ');return val})
            //console.log(JSON.stringify(data))
            
            const svg = d3.select("svg"), 
            margin = {top: 15, right: 5, bottom: 45, left: 15}, 
            width = +svg.attr("width") - margin.left - margin.right, 
            height = +svg.attr("height") - margin.top - margin.bottom, 
            x = d3.scaleBand().rangeRound([0, width]).padding(0.0), 
            y = d3.scaleLinear().rangeRound([height, 0]), 
            g = svg.append("g") 
            .attr("transform", \`translate(\${margin.left},\${margin.top})\`); 
            
            //console.log(Math.max(...data.map(d => d.jobs)))
            x.domain(data.map(d => d.day)); 
            y.domain([0, Math.max(...data.map(d => d.jobs))]); //d3.max(data, d => d.jobs)
             
            g.append("g")
            .attr("class", "axis axis-x") 
            .attr("transform", \`translate(0,\${height})\`)
            .call(d3.axisBottom(x))
            .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-9px")
            .attr("dy", "-8px")
            .attr("font-size", "14px")
            .attr("transform", "rotate(-90)");
            
            g.selectAll(".NOTHING")
            .data(data)
            .enter().append("rect") 
            .attr("class", "bar")
            .attr("x", d => x(d.day)) 
            .attr("y", d => y(d.jobs)) 
            .attr("width", x.bandwidth()) 
            .attr("height", d => height - y(d.jobs))

            g.selectAll(".NOTHING")
            .data(data)
            .enter().append("text") 
            .attr("class", "label")
            .text(d=>d.jobs > 0 ? d.jobs : '')
            .attr("x", d => x(d.day)) 
            .attr("y", d => y(d.jobs)) 
            .attr("width", x.bandwidth()) 
            .attr("height", d => height - y(d.jobs))

            
          </script>
        `
      }
      let lgs = await adminLogs().catch(error => {
        console.log('err appcp1')
        return []
      })
      let logs = `
      <table style="width: 100%; font-size:14px">
        <thead style="background-color: orange; color: black;">
          <tr style="padding: 5px">
            <td>Время</td>
            <td>Действие</td>
            <td>Примечания</td>
            <td>Id автора</td>
            <td>Email автора</td>
          </tr>
        </thead>
      <tbody>`
      lgs.forEach(val=>{
        let d = new Date(val.time).toString().split(' GMT')[0].substring(3)
        let tmp = `
          <tr>
            <td>${d}</td>
            <td>${val.action}</td>
            <td>${val.body}</td>
            <td>${val.author_id}</td>
            <td>${val.author_mail}</td>
          </tr>
        `
        logs += tmp
      })
      logs += '</tbody></table>'

      let body = `
        <h2 style="text-align:center; margin: 0;">Башня управления. ${mail} ${auth.category_rights === '777' ? 'супер-дупер' : ''}</h2>
        <hr>
        <main style="display:flex; justify-content: space-around;">
          <section>
          <style>
            * {
              font-family: sans-serif;
            }
            p{margin: 0px; margin-bottom: 5px;}
            .cpul1 li{
              margin: 10px 0;
            }
            .cpul1 li a {
              font-size: 18px;
              text-decoration: none;
              color: navy;
              
            }
            .cpul1 li a:hover {
              color: blue;
            }
          </style>
            <ul class="cpul1" style="list-style-type: none; width: 65%">
              <li>
                <a href="/allfb.json">
                  Фидбек пользователей
                  ${stts.unread_fb > 0 ? `<sup style="background-color:red;color:white;padding:2px">${stts.unread_fb}</sup>` : ''}
                </a>
              </li>
              <li>
                <a href="/adminusers.json">
                  Пользователи
                </a>
              </li>
              <li>
                <a href="/adminjobs.json">
                  Вакансии
                  ${stts.jobs_tba > 0 ? `<sup style="background-color:red;color:white;padding:2px">${stts.jobs_tba}</sup>` : ''}
                </a>
              </li>
              <li>
                <a href="/adminstats.json">
                  Числа
                </a>
              </li>
              ${auth.category_rights === '777'
                ? `<li>
                  <a href="/cpsuper.json">Суперадмин</a>
                </li>`
                : ''}
              <hr>
              <li>
                <a href="/u2out.json">Выйти</a>
              </li>
            </ul>
          </section>
          <section>
            ${sttsbody}
          </section>
          <section>
            ${sttsDaybody}
          </section>
        </main>
        <hr>
        <article class="cp_logs">
          <h3>Последние логи</h3>
          ${logs}
        </article>
      `
      let cpPage = pageParts.head + body + pageParts.footer
      
      res.send(cpPage)
    } else res.send(pageParts.noau)
  } else res.send(pageParts.noau)
}



async function tryInsertAdminCoo(mail, token) {
  let que = `UPDATE "users2" SET u2coo = $1, u2last_logged_in = NOW() where u2mail = $2`
  let params = [token, mail]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('auth2 insertion failed')
  })
  console.log('cp457', result.rows[0])
  if (result && result.rows) {
    return true
  } return undefined
  
}
async function adminAuth(mail, u2coo) {
  //here we get cookie
  //check it and bring back mail, rights, smth else
  let que1st = `SELECT u2id, category_rights FROM "users2" WHERE u2mail = $1 AND u2coo = $2`
  let params1st = [mail, u2coo]
  let result1 = await pool.query(que1st, params1st).catch(error => {
    console.log('cp adminAuth err: ', error)
    //throw new Error('job by id error')
    return undefined
  })
  //console.log('cpc p2: ', result1)
  if (result1.rows && result1.rows.length == 1) return result1.rows[0]
  else return undefined
}
async function adminStats() {
  let que = `
    SELECT  (
      SELECT COUNT(*)
      FROM jobs
      WHERE NOT is_published = True OR is_published IS NULL
      ) AS jobs_tba,
      (
      SELECT COUNT(*)
      FROM users
      WHERE role = 'subscriber'
      ) AS uscount,
      (
      SELECT COUNT(*)
      FROM users
      WHERE role = 'company'
      ) AS uccount,
      (
      SELECT COUNT(*)
      FROM jobs
      ) AS jcount,
      (
      SELECT COUNT(*)
      FROM cvhits
      ) AS hcount,
      (
      SELECT COUNT(*)
      FROM jobs
      WHERE time_created > now() - interval '1 day'
      ) AS opened_today_count,
      (
      SELECT COUNT(*)
      FROM jobs
      WHERE time_created > now() - interval '7 day'
      ) AS opened_this_week_count,
      (
      SELECT COUNT(*)
      FROM feedbacks
      WHERE "new" = True
      ) AS unread_fb
  `
  let result1 = await pool.query(que, null).catch(error => {
    console.log('cp adminStats err: ', error)
    //throw new Error('job by id error')
    return undefined
  })
  //console.log('cpc p2: ', result1)
  if (result1.rows && result1.rows.length == 1) return result1.rows[0]
  else return undefined
}

async function adminLogs() {
  let que = `
    SELECT * FROM "logs" ORDER BY time DESC LIMIT 75
  `
  let result1 = await pool.query(que, null).catch(error => {
    console.log('cp adminLogs err: ', error)
    return undefined
  })
  if (result1) return result1.rows
  else return []
}


async function getAdminHash(admin) {
  //need new table
  //console.log(admin)
  let que = `SELECT u2hash FROM "users2" WHERE u2mail = $1`
  let params = [admin]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)  
    throw new Error('check admin for login error')
  })
  //console.log('asw ', result.rows.length)
  if (result && result.rows && result.rows.length === 1) return result.rows[0].u2hash
  else return undefined
}

async function adminDayStats() {
  let que = `
    SELECT d.day, count(jobs.job_id) AS jobs
    FROM (SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD') AS day 
          FROM generate_series(0, 60, 1) AS offs
        ) d LEFT OUTER JOIN
        jobs 
        ON d.day = to_char(date_trunc('day', jobs.time_created), 'YYYY-MM-DD')  
    GROUP BY d.day
    ORDER BY d.day
  `
  let result1 = await pool.query(que, null).catch(error => {
    console.log('cp adminDayStats err: ', error)
    return undefined
  })
  if (result1 && result1.rows) return result1.rows
  else return []
}

async function adminGetFB() {
  //check auth?
  let que = `
    SELECT *
    FROM "feedbacks"
  `
  let result = await pool.query(que, null).catch(error => {
    console.log('cp adminGetFB err1: ', error)
    return false
  })
  let resu
  if (result && result.rows && result.rows.length > 0) {
    resu = result.rows
  } else resu = []
  return resu
}

async function getAllFB(req, res) {
  //auth check
  if (req.cookies && req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    //auth check
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      //res.send('step2')
      return undefined
    })
    if (auth) {
      let body = `
        ${pageParts.cplink()}
        <table style="width: 100%">
          <thead style="background-color: blue; color: white;">
            <tr style="padding: 5px">
            <td>Тема</td>
            <td>Имя</td>
            <td>Мэйл</td>
            <td>Текст</td>
            <td>Новая?</td>
            <td>Дата написания</td>
            <td>Управление</td>
            </tr>
          </thead>
          <tbody>
        
      `
      let data = await adminGetFB().catch(error => {
        console.log('cp getAllFB err1: ', error)
        return []
      })
      //console.log('cp31: ', data)
      data.forEach(val=>{
        let d = new Date(val.date_created).toString().split(' GMT')[0].substring(3)
        let tmp = `
          <tr id="tr_${val.fb_id}" ${val.new == true ? 'style="background-color: #eef"' : ''}>
            <td>${val.topic}</td>
            <td>${val.name}</td>
            <td>${val.mail}</td>
            <td>${val.desc}</td>
            <td id="new_${val.fb_id}">${val.new}</td>
            <td>${d}</td>
            <td>
              ${val.new == true ? `<button id="btn_${val.fb_id}" onclick="cmd('read', ${val.fb_id})">Прочитано</button>` : ''}
              <button onclick="cmd('del', ${val.fb_id})">Удалить</button>
            </td>
          </tr>
        `
        body += tmp
      })
      body += '</tbody></table>'
      body += `
        
        <script>
          function cmd(action, fbid) {
            let d = {action, fbid}
            
            var http = new XMLHttpRequest()
            var url = '/fbaction.json'
            http.open('POST', url, true)
            http.setRequestHeader('Content-type', 'application/json')
            //
            http.onreadystatechange = ()=>{
              if(http.readyState == 4) {
                let res = JSON.parse(http.responseText)
                //document.getElementById("viewer").textContent += http.responseText
                if (res.cmd === 'del') {
                  document.getElementById('tr_' + res.fbid).remove()
                }
                else if (res.cmd === 'read') {
                  document.getElementById('new_' + res.fbid).textContent = 'false'
                  document.getElementById('tr_' + res.fbid).style.backgroundColor = "white"
                  document.getElementById('btn_' + res.fbid).remove()
                }
              }
            }
            http.send(JSON.stringify(d))
          }
        </script>
      `
      let allFBPage = pageParts.head + body + pageParts.footer
      
      res.send(allFBPage)
    } else res.send(pageParts.noau)
  } else res.send(pageParts.noau)
}


async function fbaction(req, res) {
  //2 types of action, then redirect to allfb.json
  let cmd //read or del
  if (req.body.action == 'read') cmd = 'read'
  else if (req.body.action == 'del') cmd = 'del'
  else {
    res.send('wrong cmd')
    return false
  }
  let fbid = parseInt(req.body.fbid)
  if (isNaN(fbid) || fbid < 0 || String(fbid).length > 10) {
    console.log('Error: wrong fb id')
    res.status(400).send('Неправильный id')
    return false
  }
  if (req.cookies && req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      //res.send('step2')
      return undefined
    })
    if (auth) {
      if (cmd == 'read') {
        let succ = await u2fbread(fbid).catch(error => {
          //res.send('step2')
          return undefined
        })
        res.send({cmd: 'read', fbid: fbid})
      } else
      if (cmd == 'del') {
        let succ = await u2fbdel(fbid).catch(error => {
          //res.send('step2')
          return undefined
        })
        res.send({cmd: 'del', fbid: fbid})
      }
    } else res.send('error2; wrong mail or pw format')
  } else res.send('error1; wrong mail or pw format')
}

async function u2fbread(id) {
  let que2 = `
    UPDATE feedbacks SET "new" = false
    WHERE fb_id = $1
  `
  let params2 = [id]
  let result2 = await pool.query(que2, params2).catch(error => {
    console.log('cp u2fbread err2: ', error)
    return false
  })
  return Boolean(result2)
}
async function u2fbdel(id) {
  let que2 = `
    DELETE FROM feedbacks
    WHERE fb_id = $1
  `
  let params2 = [id]
  let result2 = await pool.query(que2, params2).catch(error => {
    console.log('cp u2fbdel err2: ', error)
    return false
  })
  return Boolean(result2)
}

async function adminGetUsers() {
  //check auth?
  let que = `
    SELECT *
    FROM "users"
    ORDER BY user_id DESC
  `
  let result = await pool.query(que, null).catch(error => {
    console.log('cp adminGetUsers err1: ', error)
    return false
  })
  let resu
  if (result && result.rows && result.rows.length > 0) {
    resu = result.rows
    resu.forEach(function(v){ delete v.pwhash; delete v.auth_cookie });

  } else resu = []
  return resu
}

async function adminUsers(req, res) {
  //auth check
  if (req.cookies && req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    //auth check
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      //res.send('step2')
      return undefined
    })
    if (auth) {
      let body = `
        <style>
          .hidden {
            display: none;
          }
        </style>
        <h2 style="text-align:center; margin: 0;">Пользователи</h2>
        ${pageParts.cplink()}
        <table style="width: 100%; font-size:14px">
          <thead style="background-color: green; color: white;">
            <tr style="padding: 5px">
              <td>uid</td>
              <td>email</td>
              <td>role</td>
              <td>time_created</td>
              <td>last_logged_in</td>
              <td>name</td>
              <td>surname</td>
              <td>company</td>
              <td>Верифиц</td>
              <td>Рабочий?</td>
              <td>Причина блока</td>
              <td>Управление</td>
            </tr>
          </thead>
          <tbody>
        
      `
      let data = await adminGetUsers().catch(error => {
        console.log('cp adminGetUsers err1: ', error)
        return []
      })
      //console.log('cp32: ', data)
      data.forEach(val=>{
        let d = new Date(val.time_created).toString().split(' GMT')[0].substring(3)
        let d2 = new Date(val.last_logged_in).toString().split(' GMT')[0].substring(3)
        let tmp = `
          <tr id="tr_${val.user_id}">
            <td>${val.user_id}</td>
            <td>${val.email}</td>
            <td>${val.role}</td>
            <td>${d}</td>
            <td>${d2}</td>
            <td>${val.name}</td>
            <td>${val.surname}</td>
            <td>${val.company}</td>
            <td>${val.email_confirmed}</td>
            <td id="ia_${val.user_id}">${val.is_active}</td>
            <td id="br_${val.user_id}" style="max-width: 110px;">${val.block_reason}</td>
            <td>
              <div id="block_ctr_${val.user_id}" ${val.is_active == false ? 'class="hidden"' : ''}>
                <button onclick="popup(${val.user_id})">Блок</button>
                <div id="block_sub_${val.user_id}" class="hidden">
                  <textarea id="ta_${val.user_id}" style="color: black" placeholder="укажите причину"></textarea>
                  <button onclick="block_u(${val.user_id}, false)">Блокировать</button>
                </div>
              </div>
              <button id="unblock_${val.user_id}" ${val.is_active == true ? 'class="hidden"' : ''} onclick="block_u(${val.user_id}, true)">Разблок</button>
              <button onclick="if (confirm('Удалится пользователь, все его вакансии и поданные резюме, удалить?')) delete_u(${val.user_id})">Удалить</button>
            </td>
          </tr>
        `
        body += tmp
      })
      body += '</tbody></table>'
      body += `
        <script>
          function popup(uid) {
            document.getElementById("block_sub_" + uid).classList.toggle("hidden")
          }
          function block_u(uid, set_active_to) {
            let block_reason = Boolean(set_active_to) ? '' : document.getElementById("ta_" + uid).value
            let action = Boolean(set_active_to) ? 'unblock' : 'block'
            let d = {action, uid, block_reason}
            //console.log(d)
            var http = new XMLHttpRequest()
            var url = '/auaction.json'
            http.open('POST', url, true)
            http.setRequestHeader('Content-type', 'application/json')
            //
            document.getElementById("block_sub_" + uid).classList.add("hidden")
            document.getElementById("block_ctr_" + uid).classList.toggle("hidden")
            document.getElementById("ia_" + uid).textContent = set_active_to
            document.getElementById("br_" + uid).textContent = block_reason
            document.getElementById("ta_" + uid).value = ''
            document.getElementById("unblock_" + uid).classList.toggle("hidden")
            http.onreadystatechange = function() {
              if(http.readyState == 4 && http.status == 200) {
                console.log('cpo2: ', http.responseText)
              }
            }
            http.send(JSON.stringify(d))
          }
          function delete_u(uid) {
            let d = {action: 'del', uid}
            var http = new XMLHttpRequest()
            var url = '/auaction.json'
            http.open('POST', url, true)
            http.setRequestHeader('Content-type', 'application/json')
            document.getElementById("tr_" + uid).remove()
            http.onreadystatechange = function() {
              if(http.readyState == 4 && http.status == 200) {
                console.log('cpo2: ', http.responseText)
              }
            }
            http.send(JSON.stringify(d))
          }
        </script>
      `
      let allUsersPage = pageParts.head + body + pageParts.footer
      
      res.send(allUsersPage)
    } else res.send(pageParts.noau)
  } else res.send(pageParts.noau)
}

async function adminGetJobs() {
  //no need to check auth, because this is not a route

      let que = `
        SELECT *
        FROM "jobs"
        ORDER BY time_created DESC

      `
      let result = await pool.query(que, null).catch(error => {
        console.log('cp adminGetJobs err1: ', error)
        return false
      })
      let resu
      if (result && result.rows && result.rows.length > 0) {
        resu = result.rows
      } else resu = []
      return resu
}

async function adminJobs(req, res) {
  //auth check
  if (req.cookies && req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    //auth check
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      return undefined
    })
    if (auth) {
      let body = `
        <style>
        .hidden {
          display: none;
        }
        tr:nth-child(even) {background: #DCD}
        a {color:blue; text-decoration: none}
        a:visited {color:blue}
        </style>
        <h2 style="text-align:center; margin: 0;">Вакансии</h2>
        ${pageParts.cplink()}
        <table style="width: 100%; font-size:14px">
          <thead style="background-color: purple; color: white;">
            <tr style="padding: 5px">
              <td>jid</td>
              <td>title</td>
              <td>aid</td>
              <td>time_updated</td>
              <td>is_published</td>
              <td>currency</td>
              <td>contact_mail</td>
              <td>contact_tel</td>
              <td>Закрыта?</td>
              <td>closed_why</td>
              <td>Управление</td>
            </tr>
          </thead>
          <tbody>
        
      `
      let data = await adminGetJobs().catch(error => {
        console.log('cp adminGetJobs err1: ', error)
        return []
      })
      
      data.forEach(val=>{
        let d = new Date(val.time_updated).toString().split(' GMT')[0].substring(3)
        let tmp = `
          <tr id="jtr_${val.job_id}" ${(val.is_published == false && val.is_closed == false) ? 'style="font-weight: 700"' : ''}>
            <td>${val.job_id}</td>
            <td><a href="/jobpage?id=${val.job_id}" target="_blank">${val.title}</a></td>
            <td>${val.author_id}</td>
            <td>${d}</td>
            <td id="td_apr_${val.job_id}">${val.is_published}</td>
            <td>${val.currency}</td>
            <td>${val.contact_mail}</td>
            <td>${val.contact_tel}</td>
            <td id="td_ic_${val.job_id}">${val.is_closed}</td>
            <td id="td_cw_${val.job_id}">${val.closed_why}</td>
            <td style="width: 180px; display: flex">
              ${val.is_closed == false
                ? `
                  <div id="cl_ctr_${val.job_id}">
                    <button style="padding:0" onclick="popup(${val.job_id})">Закрытие</button>
                    <div id="close_${val.job_id}" class="hidden">
                      <textarea id="ta_${val.job_id}" style="color: black" placeholder="укажите причину"></textarea>
                      <button style="padding:0" onclick="sendclosejob(${val.job_id})">Закрыть</button>
                    </div>
                  </div>
                `
                : ''
              }
              <button style="padding:0" onclick="senddeljob(${val.job_id})">Удалить</button>
              ${val.is_published
                ? ''
                : `<button id="btn_apr_${val.job_id}" style="padding:0" onclick="sendaprjob(${val.job_id})">Одобрить</button>`
              }
            </td>
          </tr>
        `
        body += tmp
      })
      body += '</tbody></table>'
      body += `
        <script>
          function popup(jid) {
            document.getElementById("close_" + jid).classList.toggle("hidden")
          }
          function sendclosejob(jid) {
            let closed_why = document.getElementById("ta_" + jid).value
            let d = {closed_why, jid}
            //console.log(d)
            var http = new XMLHttpRequest()
            var url = '/admnjobclo.json'
            http.open('POST', url, true)
            http.setRequestHeader('Content-type', 'application/json')
            //
            document.getElementById("td_ic_" + jid).textContent = 'true'
            document.getElementById("td_apr_" + jid).textContent = 'false'
            document.getElementById("td_cw_" + jid).textContent = closed_why
            document.getElementById("cl_ctr_" + jid).remove()
            http.onreadystatechange = function() {
              if(http.readyState == 4 && http.status == 200) {
                console.log('cpo1: ', http.responseText)

              }
            }
            http.send(JSON.stringify(d))
          }

          function senddeljob(jid) {
            let d = {jid}
            //console.log(d)
            var http = new XMLHttpRequest()
            var url = '/admnjobdel.json'
            http.open('POST', url, true)
            http.setRequestHeader('Content-type', 'application/json')
            //
            document.getElementById("jtr_" + jid).remove()
            http.onreadystatechange = function() {
              if(http.readyState == 4 && http.status == 200) {
                console.log('cpo2: ', http.responseText)

              }
            }
            http.send(JSON.stringify(d))
          }
          function sendaprjob(jid) {
            let d = {jid}
            //console.log(d)
            var http = new XMLHttpRequest()
            var url = '/admnjobapr.json'
            http.open('POST', url, true)
            http.setRequestHeader('Content-type', 'application/json')
            //
            document.getElementById("td_apr_" + jid).textContent = 'true'
            document.getElementById("td_cw_" + jid).textContent = ''
            document.getElementById("btn_apr_" + jid).remove()
            document.getElementById("jtr_" + jid).style.fontWeight = '400'
            
            http.onreadystatechange = function() {
              if(http.readyState == 4 && http.status == 200) {
                console.log('cpo3: ', http.responseText)

              }
            }
            http.send(JSON.stringify(d))
          }
        </script>
      `
      let allJobsPage = pageParts.head + body + pageParts.footer
      
      res.send(allJobsPage)
    } else res.send(pageParts.noau)
  } else res.send(pageParts.noau)
}

async function adminGetStats() {
  //check auth?
  let que = `
    SELECT *
    FROM cached_salary_stats
    ORDER BY statname DESC
  `
  let result = await pool.query(que, null).catch(error => {
    console.log('cp adminGetStats err1: ', error)
    return false
  })
  let resu
  if (result && result.rows && result.rows.length > 0) {
    resu = result.rows
    //resu.forEach(function(v){ delete v.pwhash; delete v.auth_cookie });
  } else resu = []
  return resu
}

async function adminStatsRoute(req, res) {
  //Страница в админке для изменения статистики показываемой пользователю в разных местах, типа зарплаты, топ профессий
  if (req.cookies && req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      //res.send('step2')
      return undefined
    })
    if (auth) {
      let body = `
      <style>
        .hidden {
          display: none;
        }
        tr:nth-child(even) {background: #DCD}
        a {color:blue; text-decoration: none}
        a:visited {color:blue}
      </style>
      <h2 style="text-align:center; margin: 0;">Статистика для пользователей</h2>
      ${pageParts.cplink()}
      <table style="width: 100%; font-size:14px">
        <thead style="background-color: royalblue; color: white;">
          <tr style="padding: 5px">
            <td>statname</td>
            <td>statlabel</td>
            <td>statvalue</td>
            <td>statcurrency</td>
            <td>time_updated</td>
            <td>Управление</td>
          </tr>
        </thead>
        <tbody> 
      `
      let data = await adminGetStats().catch(error => {
        console.log('cp adminGetStats err1: ', error)
        return []
      })
      data.forEach(val=>{
        let d = new Date(val.time_updated).toString().split(' GMT')[0].substring(3)
        let tmp = `
          <tr>
            <td>${val.statname}</td>
            <td>${val.statlabel}</td>
            <td>${val.statvalue}</td>
            <td>${val.statcurrency}</td>
            <td>${d}</td>
            <td style="width: 180px; display: flex">
            </td>
          </tr>
        `
        body += tmp
      })
      body += '</tbody></table>'
      body +='<button onclick="regen()">Перегенерировать всё</button>'
      body += `
        <script>
          function regen() {
            let d = {}
            var http = new XMLHttpRequest()
            var url = '/userstatregen.json'
            http.open('POST', url, true)
            http.setRequestHeader('Content-type', 'application/json')
            http.onreadystatechange = function() {
              if(http.readyState == 4 && http.status == 200) {
                console.log('cpo1: ', http.responseText)
                window.location.href = "/adminstats.json"
              }
            }
            http.send(JSON.stringify(d))
          }
        </script>
      `
      let wholeStatsPage = pageParts.head + body + pageParts.footer
      
      res.send(wholeStatsPage)
    } else res.send(pageParts.noau)
  } else res.send(pageParts.noau)
}

async function adminGetUsers2() {
  //check auth?
  let que = `
    SELECT u2id, u2mail, category_rights, u2last_logged_in, supernote
    FROM "users2"
    WHERE category_rights IS DISTINCT FROM '777'
  `
  let result = await pool.query(que, null).catch(error => {
    console.log('cp adminGetUsers2 err1: ', error)
    return false
  })
  let resu
  if (result && result.rows && result.rows.length > 0) {
    resu = result.rows

  } else resu = []
  
  return resu
}

async function superAdmin(req, res) {
  if (req.cookies && req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    //auth check
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      //res.send('step2')
      return undefined
    })
    
    if (auth && auth.category_rights === '777') {
      let u2list = await adminGetUsers2().catch(error => {
        console.log('cp adminGetUsers2 err1: ', error)
        return []
      })
      
      let list_p1 = `
      <table style="width: 100%; font-size:14px">
        <thead style="background-color: purple; color: white;">
          <tr style="padding: 5px">
            <td>Логин</td>
            <td>category_rights</td>
            <td>u2last_logged_in</td>
            <td>supernote</td>
            <td>управление</td>
          </tr>
        </thead>
      <tbody>`
      u2list.forEach(val=>{
        let d = new Date(val.u2last_logged_in).toString().split(' GMT')[0].substring(3)
        let tmp = `
          <tr id=${val.u2id}>
            <td>${val.u2mail}</td>
            <td>${val.category_rights}</td>
            <td>${d}</td>
            <td>${val.supernote}</td>
            <td>
              <button>Выключить акк</button>
              <button>Изменить права</button>
              <button>Изменить заметку</button>
            </td>
          </tr>
        `
        list_p1 += tmp
      })
      list_p1 += '</tbody></table>'
      let body = `
        <main>
          ${pageParts.cplink()}
          <section>
            <h4 style="margin:0; margin-top:10px;">Добавление нового модера</h4>
            <table borders="1">
              <tr>
                <td style="width:130px">mail</td>
                <td style="width:130px">pw</td>
                <td style="width:390px">note</td>
              </tr>
              <tr>
                <td style="border: 1px solid black" id="newmail" contenteditable="true"></td>
                <td style="border: 1px solid black" id="newpw" contenteditable="true"></td>
                <td style="border: 1px solid black" id="note" contenteditable="true"></td>
              </r>
            </table>
            <button onclick="addNew()">Добавить модера</button>
            <div id="viewer"></div>
            <script>
              function addNew() {
                let newmail = document.getElementById("newmail").textContent
                let newpw = document.getElementById("newpw").textContent
                let note = document.getElementById("note").textContent
                let d = {newmail, newpw, note}
                console.log(d)
                var http = new XMLHttpRequest()
                var url = '/newu2.json'
                http.open('POST', url, true)
                http.setRequestHeader('Content-type', 'application/json')
                //
                http.onreadystatechange = function() {
                  if(http.readyState == 4 && http.status == 200) {
                    document.getElementById("viewer").textContent += http.responseText
                  }
                }
                http.send(JSON.stringify(d))
              }
            </script>
          </section>
          <section>
            <h4 style="margin:0; margin-top:10px;">Список модеров</h4>
            ${list_p1}
          </section>
        </main>
      `
      let superPage = pageParts.head + body + pageParts.footer
      res.send(superPage)
    } else res.send(pageParts.noau)
  } else res.send(pageParts.noau)
}


async function u2out(req, res) {
  //maybe delete stuff in db and write some statistics down
  //for now just reset cookies and send back OK
  res.cookie('sessioa', '')
  res.cookie('user2', '')
  // res.send('OK. u2out')
  res.send(`<html><script>window.location.href = "/cplogin.json"</script></html>`)
}


async function adminNew(req, res) {
  let mail = req.body.newmail
  let pw = req.body.newpw
  let note = req.body.note
  if (note.length > 750) note = note.substr(0,750)
  if (SupremeValidator.isValidEmail(mail) && SupremeValidator.isValidPW(pw)) {
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      //res.send('step2')
      return undefined
    })
    if (auth && auth.category_rights === '777') {
      let user2Id = await tryInsertEmailAdmin(mail).catch(error => {
        res.send('error4, not uniq mail')
        return undefined
      })
      if (user2Id === undefined) {
        return false
      }
      //if id is back mail is uniq else ret
      let hash = bcrypt.hashSync(pw, bcrypt.genSaltSync(9))
      //store rest of the new user
      let isDone = await registerFinishAdmin(user2Id, mail, hash, note).catch(error => {
        console.log('STEP5', error)
        res.send('step5')
        return false
      })
      if (isDone === false) return false
      console.log('admin reg ok!')
      res.send('OK')
    } else res.send('error5; wrong mail or pw format')
  } else res.send('error3; wrong mail or pw format')
}


async function registerFinishAdmin (id, mail, hash, note) {
  let que = `
    UPDATE "users2"
    SET (u2hash, category_rights, supernote) = ($1, '111', $4)
    WHERE u2id = $2 AND u2mail = $3
  `
  let params = [hash, id, mail, note]
  let result = await pool.query(que, params).catch(error => {
    console.log('cp iii: ', error)
    throw new Error('user update fail')
  })
  return true
}


async function tryInsertEmailAdmin (mail) {
  let que = `INSERT INTO "users2" ("u2mail") VALUES ($1) RETURNING u2id`
  let params = [mail]
  let result
  try {
    result = await pool.query(que, params)
  } catch(e) {
    throw new Error('email2 exists already')
  }
  //console.log('tryingInsert in the end: ', result.rows[0])
  return result.rows[0].u2id
}


async function closeJobByIdAdmin(req, res) {
  const closed_why = req.body.closed_why
  const jid = parseInt(req.body.jid)
  console.log(closed_why, jid)
  if (isNaN(jid) || jid < 0 || String(jid).length > 10) {
    console.log('Error: wrong id')
    res.status(400).send('Неправильный id вакансии.')
    return false
  }
  if (closed_why.length > 500) closed_why = closed_why.substring(0,499)
  if (req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    //console.log('cpsrv', jid)
    let que1st = `SELECT u2id FROM "users2" WHERE "u2coo" = $1 AND u2mail = $2`
    let params1st = [req.cookies.sessioa, req.cookies.user2]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        console.log(error)
        //res.send('step2')
        //throw error
        return false
      }
      if (Boolean(results) == false || results.rows.length < 1) {
        console.log('no cookie found')
        //Если юзера с таким куки не найдено, то выходим из функции прост
        res.send('step3')
        return false
      }
      console.log('closejob2 cp1')
      //по айди
      //если есть в базе и автор сам удаляющий
      //удалить
      let que2nd = `UPDATE jobs SET (is_published, is_closed, time_updated, closed_why) = (FALSE, TRUE, NOW(), $1) WHERE job_id = $2`
      //console.log(que2nd)
      let params2nd = [closed_why, jid]
      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          console.log('closeJobById2 Error2: ', error2)
          res.status(400).send('error22')
          return false
        }
        res.status(200).send('OK')
        //Добавление логов
        addLog('Вакансия закрыта(A)', 'Id вакансии: ' + jid, results.rows[0].u2id, '(Модератор) ' + req.cookies.user2)
        //res.send(results2.rows)
      })

    })
  } else {res.send('wrong userinfo(closeJBIA)')}
}


async function approveJobByIdAdmin(req, res) {
  const jid = parseInt(req.body.jid)
  if (isNaN(jid) || jid < 0 || String(jid).length > 10) {
    console.log('Error: wrong id')
    res.status(400).send('Неправильный id вакансии.')
    return false
  }
  if (req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    let que1st = `SELECT u2id FROM "users2" WHERE "u2coo" = $1 AND "u2mail" = $2`
    let params1st = [req.cookies.sessioa, req.cookies.user2]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        console.log(error)
        res.send('step2')
        //throw error
        return false
      }
      if (results.rows.length < 1) {
        console.log('no cookie found')
        //Если юзера с таким куки не найдено, то выходим из функции прост
        res.send('step3')
        return false
      }
      
      //по айди
      //если есть в базе и автор сам удаляющий
      //удалить
      
      let que2nd = `UPDATE jobs SET (is_published, time_updated, closed_why) = (TRUE, NOW(), '') WHERE job_id = $1`
      let params2nd = [jid]
      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          console.log('approveJobByIdAdmin Error2: ', error2)
          res.status(400).send('error222')
          return false
        }
        res.status(200).send('OK')
        addLog('Вакансия одобрена(A)', 'Id вакансии: ' + jid, results.rows[0].u2id, '(Модератор) ' + req.cookies.user2)
      })

    })
  } else {res.send('wrong userinfo(approveJBIA)')}
}

async function deleteJobByIdAdmin(req, res) {
  const jid = parseInt(req.body.jid)
  //проверить жоб айди формально
  
  if (isNaN(jid) || jid < 0 || String(jid).length > 10) {
    console.log('Error: wrong id')
    res.status(400).send('Неправильный id вакансии.')
    return false
  }

  if (req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    //console.log('cpsrv', jid)
    let que1st = `SELECT u2id FROM "users2" WHERE "u2coo" = $1 AND "u2mail" = $2`
    let params1st = [req.cookies.sessioa, req.cookies.user2]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        console.log(error)
        res.send('step2')
        //throw error
        return false
      }
      if (results.rows.length < 1) {
        console.log('no cookie found')
        //Если юзера с таким куки не найдено, то выходим из функции прост
        res.send('step3')
        return false
      }
      
      //по айди
      //если есть в базе и автор сам удаляющий
      //удалить
      
      let que2nd = `DELETE FROM jobs WHERE job_id = $1`
      let params2nd = [jid]
      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          console.log('deleteJobByIdAdmin Error2: ', error2)
          res.status(400).send('error222')
          return false
        }
        res.status(200).send('OK')
        addLog('Вакансия удалена(A)', 'Id вакансии: ' + jid, results.rows[0].u2id, '(Модератор) ' + req.cookies.user2)
      })

    })
  } else {res.send('wrong userinfo(deleteJBIA)')}
}


async function userStatRegen(req, res) {
  //generate new stuff
  if (req.cookies && req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      //res.send('step2')
      return undefined
    })
    if (auth) {
      let que = `
        SELECT salary_min, salary_max, currency FROM jobs
        WHERE salary_min = (SELECT MIN(sal)
        FROM (SELECT salary_min as sal, currency
        FROM jobs
        WHERE salary_min > 0
        UNION ALL
        SELECT salary_max as sal, currency
        FROM jobs
        WHERE salary_max > 0) AS sal) or salary_max = (SELECT MIN(sal)
        FROM (SELECT salary_min as sal, currency
        FROM jobs
        WHERE salary_min > 0
        UNION ALL
        SELECT salary_max as sal, currency
        FROM jobs
        WHERE salary_max > 0) AS sal)
      `
      //let salMin
      var result = await pool.query(que, null).catch(error => {
        console.log('cp userStatRegen err1: ', error)
        return false
      })
      let resubig = []
      let resu = {}
      if (result && result.rows && result.rows.length > 0) {
        resu.salMin = result.rows[0]
        let salMin = 0
        if (resu.salMin.salary_min > 0) salMin = resu.salMin.salary_min
        else salMin = resu.salMin.salary_max
        salMinCurr = resu.salMin.currency
        if ((salMin < 870 && salMinCurr == 'm') || (salMin < 248 && salMinCurr == '$')) {
          salMin = 870
          salMinCurr = 'm'
        }
        
        console.log(resu.salMin)
        let que = `
          UPDATE cached_salary_stats
          SET (statvalue, statcurrency, time_updated) = (${salMin}, '${salMinCurr}', NOW())
          WHERE statname = 'salMin'
        `
        let result2 = await pool.query(que, null).catch(error => {
          console.log('cp userStatRegen err2: ', error)
          return false
        })

      }
      resubig.push(resu)
      
        


      let que3 = 'SELECT salary_min, salary_max, currency FROM jobs'
      var result = await pool.query(que3, null).catch(error => {
        console.log('cp userStatRegen err5: ', error)
        return false
      })
      if (result && result.rows && result.rows.length > 0) {
        var dataa = result.rows
        var sals = []
        //
        for (let index = 0; index < dataa.length; index++) {
          if (dataa[index].currency == '$') {
            dataa[index].currency = 'm'
            dataa[index].salary_min = dataa[index].salary_min * 3.5
            dataa[index].salary_max = dataa[index].salary_max * 3.5
          }
          var tmp = []
          if (dataa[index].salary_min > 0) tmp.push(dataa[index].salary_min)
          if (dataa[index].salary_max > 0) tmp.push(dataa[index].salary_max)
          if (tmp.length == 2) {
            sals.push((tmp[0] + tmp[1]) / 2)
          } else
          if (tmp.length == 1) sals.push(tmp[0])
        }
        sum = 0
        sals.forEach(v=>sum += v)
        avgSal = Math.round(sum / sals.length)
        let que = `
          UPDATE cached_salary_stats
          SET (statvalue, statcurrency, time_updated) = (${avgSal}, 'm', NOW())
          WHERE statname = 'salAvg'
        `
        let result2 = await pool.query(que, null).catch(error => {
          console.log('cp userStatRegen err6: ', error)
          return false
        })
      }

      let que4 = `SELECT title, job_id, salary_min, salary_max, currency FROM jobs WHERE time_updated > now() - interval '1 month'`
      var result = await pool.query(que4, null).catch(error => {
        console.log('cp userStatRegen err7: ', error)
        return false
      })
      if (result && result.rows && result.rows.length > 0) {
        var dataa = result.rows
        for (let index = 0; index < dataa.length; index++) {
          if (dataa[index].currency == '$') {
            dataa[index].currency = 'm'
            dataa[index].salary_min = dataa[index].salary_min * 3.5
            dataa[index].salary_max = dataa[index].salary_max * 3.5
          }
          if (dataa[index].salary_max < dataa[index].salary_min) dataa[index].salary_max = dataa[index].salary_min
        }
        //теперь отсорт по salmax
        
        dataa.sort((a,b)=>b.salary_max - a.salary_max)
        // console.log(dataa)
        let salMax = dataa[0].salary_max
        let salMaxCurr = 'm'
        let quex = `
          UPDATE cached_salary_stats
          SET (statvalue, statcurrency, time_updated) = (${salMax}, '${salMaxCurr}', NOW())
          WHERE statname = 'salMax';
        `
        for (let x1 = 0; x1 < 6; x1++) {
          //first five
          quex += `
            UPDATE cached_salary_stats SET 
            (statvalue, time_updated, statlabel, statcurrency, statlink) = (${dataa[x1].salary_max}, NOW(), '${dataa[x1].title}', 'm', ${dataa[x1].job_id})
            WHERE statname = 'top${x1 + 1}';
          `
        }

        var result = await pool.query(quex, null).catch(error => {
          console.log('cp userStatRegen err8: ', error)
          return false
        })
      }

      addLog('Manual userstat regen', '-', auth.u2id, '(Модератор) ' + req.cookies.user2)
      res.send('OK')
      //res.send(`<html><script>window.location.href = "/cplogin.json"</script></html>`)
    } else res.send('Auth error 2')
  } else res.send('Auth error 1')
}


async function u2aublock(id, block_reason, active_state, u2id, user2) {
  if (active_state != true) active_state = false
  let que2 = `
    UPDATE users SET ("is_active", "block_reason") = ($1, $2)
    WHERE user_id = $3
  `
  let params2 = [active_state, block_reason, id]
  let result2 = await pool.query(que2, params2).catch(error => {
    console.log('cp u2aublock err2: ', error)
    return false
  })
  //Добавление логов
  let logcmd = active_state ? 'Разблок пользователя(A)' : 'Блок пользователя(A)'
  let logbody = active_state ? 'Id пользователя: ' + id : 'Id пользователя: ' + id + ', причина: ' + block_reason
  addLog(logcmd, logbody, u2id, '(Модератор) ' + user2)
  return Boolean(result2)
}
async function u2audelete(id, u2id, user2) {
  let que = `
    DELETE FROM users
    WHERE user_id = $1
  `
  let params = [id]
  let result = await pool.query(que, params).catch(error => {
    console.log('cp u2aublock err2: ', error)
    return false
  })
  //Добавление логов
  addLog('Удаление пользователя(A)', 'Id пользователя: ' + id, u2id, '(Модератор) ' + user2)
  return Boolean(result)
}

async function auaction(req, res) {
  let cmd //read or del
  if (req.body.action == 'block') cmd = 'block'
  else if (req.body.action == 'unblock') cmd = 'unblock'
  else if (req.body.action == 'del') cmd = 'del'
  else {
    res.send('wrong cmd')
    return false
  }
  let uid = parseInt(req.body.uid)
  if (isNaN(uid) || uid < 0 || String(uid).length > 10) {
    console.log('Error: wrong id')
    res.status(400).send('Неправильный id')
    return false
  }
  if (req.body.block_reason && req.body.block_reason.length > 500) req.body.block_reason = req.body.block_reason.substring(0,499)
  if (req.cookies && req.cookies.sessioa && req.cookies.sessioa.length > 50 && req.cookies.user2) {
    let auth = await adminAuth(req.cookies.user2, req.cookies.sessioa).catch(error => {
      //res.send('step2')
      return undefined
    })
    if (auth) {
      if (cmd == 'block') {
        let succ = await u2aublock(uid, req.body.block_reason, false, auth.u2id, req.cookies.user2).catch(error => {
          //res.send('step2')
          return undefined
        })
        res.send({cmd: 'block', id: uid})
      } else
      if (cmd == 'unblock') {
        let succ = await u2aublock(uid, '', true, auth.u2id, req.cookies.user2).catch(error => {
          //res.send('step2')
          return undefined
        })
        res.send({cmd: 'unblock', id: uid})
      } else
      if (cmd == 'del') {
        let succ = await u2audelete(uid, auth.u2id, req.cookies.user2).catch(error => {
          //res.send('step2')
          return undefined
        })
        res.send({cmd: 'del', id: uid})
      }
    } else res.send('error2; wrong mail or pw format')
  } else res.send('error1; wrong mail or pw format')
}


module.exports = {
  adminPanel,
  adminLogin,
  cpLoginEndpoint,
  getAllFB,
  adminUsers,
  adminJobs,

  adminStatsRoute,
  superAdmin,
  u2out,
  adminNew,

  fbaction,
  closeJobByIdAdmin,
  deleteJobByIdAdmin,
  approveJobByIdAdmin,
  auaction,

  userStatRegen,
}