const pupeteer = require('puppeteer')

scrapGitHub("https://www.residentadvisor.net/events/de/berlin")

async function scrapGitHub(url) {
    const browser = await pupeteer.launch()
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2' })

    const ul = await page.$eval('#items', ul =>

        Array.from(ul.querySelectorAll('li'), li => {
            let date = li.querySelector('.event-item>span>time')
            if (date) date = date.innerHTML
            console.log('date :', date);
            let event = li.querySelector('.event-title>a')
            if (event) event = event.innerHTML
            let club = li.querySelector('.event-title>span>a')
            if (club) club = club.innerHTML
            console.log('club :', club);
            if (event && club) return { date, event, club }
        }).filter(e => e != null)

    )

    console.log('ul :', ul);



    // const li = Array.from(ul.querySelectorAll('li').some(li => console.log('li', li)))
    //console.log('li :', li);


    //const [el] = await page.$x('/html/body/form/main/ul/li[2]/div[2]/div/div[2]/ul')
    // const [el] = await page.$x('/html/body/form/main/ul/li[2]/div[2]/div/div[2]/ul/li[2]/article/div/h1/a')
    //console.log('el :', el);
    //const src = await el.getProperty('src')
    // console.log('src :', src);
    //const srcTxt = src.jsonValue()
    // console.log('srcTxt :', srcTxt);
}