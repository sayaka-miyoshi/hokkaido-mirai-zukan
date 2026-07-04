const html = await (await fetch('https://www.hokkaido-miraizukan.jp/post/4')).text()
console.log('has G-JEEYE86YNZ', html.includes('G-JEEYE86YNZ'))
console.log('has G-9Q0MGFPBZ6', html.includes('G-9Q0MGFPBZ6'))
console.log('has gtag/js', html.includes('googletagmanager.com/gtag/js'))
console.log('has ga4-init', html.includes('ga4-init'))
console.log('has window.gtag', html.includes('window.gtag'))
console.log('send_page_view', html.includes('send_page_view'))
const ids = html.match(/G-[A-Z0-9]+/g)
console.log('GA ids', ids)

const p278 = await (await fetch('https://www.hokkaido-miraizukan.jp/post/278')).text()
const areas = [...p278.matchAll(/href="(\/area\/[^"]+)"/g)].map((m) => m[1])
console.log('post278 area links', areas)

const areaJp = await fetch('https://www.hokkaido-miraizukan.jp/area/%E6%B4%9E%E7%88%BA%E6%B9%96', {
  redirect: 'manual',
})
console.log('area/洞爺湖 status', areaJp.status, areaJp.headers.get('location'))
const areaToyako = await fetch('https://www.hokkaido-miraizukan.jp/area/toyako')
console.log('area/toyako status', areaToyako.status)
