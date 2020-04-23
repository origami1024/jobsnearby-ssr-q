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
// exports.foot = exports.footer + exports.end


exports.noau = `
  <head><style>
    .detailed__line {
      display: flex;
    }
  </style></head><body>
  <div>
    Ошибка 505001, страницы не существует, бубубу
  </div>
  </body></html>`


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