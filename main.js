const pupeteer = require('puppeteer')
const express = require('express');
const fs = require('fs');

const app = express();

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Express server running on port ${port}`)
});
const countryCode = 'fr'
const city = 'paris'
scrapGitHub(`https://www.residentadvisor.net/events/${countryCode}/${city}`)

async function scrapGitHub(url) {
    const browser = await pupeteer.launch()
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2' })

    const events = await page.$eval('#items', ul =>

        Array.from(ul.querySelectorAll('li'), li => {
            let date = li.querySelector('.event-item>span>time')
            if (date) date = date.innerHTML
            console.log('date :', date);
            let event = li.querySelector('.event-title>a')
            if (event) event = event.innerHTML
            let club = li.querySelector('.event-title>span>a')
            if (club) club = club.innerHTML
            let artists = li.querySelector('.bbox>div')
            if (artists) artists = artists.innerHTML.split(', ')
            console.log('club :', club);
            if (event) return { date, event, artists, club }
        }).filter(e => e != null)

    )

    // writeJson(events)

    app.get('/',
        (req, res) =>

            res.send({ countryCode, city, events })
    )


}

function writeJson(jsonObj) {
    var jsonContent = JSON.stringify(jsonObj);
    fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
}