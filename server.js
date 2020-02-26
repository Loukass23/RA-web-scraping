const pupeteer = require('puppeteer')
const express = require('express');
const fs = require('fs');
const bodyParser = require("body-parser");
var eventsJson = require("./events.json"); // path of your json file



const app = express();
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

var events

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Express server running on port ${port}`)
});
app.post('/events',
    async (req, res) => {
        const { countryCode, city } = req.body
        events = await scrapRA(`https://www.residentadvisor.net/events/${countryCode}/${city}`)

        console.log('events :', events);
        res.json({ "msg": "Events are here" })
        // try {
        // res.send('ok')
        // } catch (error) {
        //     res.send(error)
        // }
    })
app.get('/events', (req, res) => {
    try {
        // res.send(events)
        res.json(eventsJson)
    } catch (error) {
        res.send(error)
    }
})

async function scrapRA(url) {
    try {
        const browser = await pupeteer.launch()
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'networkidle2' })

        const events = await page.$eval('#items', ul =>

            Array.from(ul.querySelectorAll('li'), li => {
                let date = li.querySelector('.event-item>span>time')
                if (date) date = date.innerHTML
                let event = li.querySelector('.event-title>a')
                if (event) event = event.innerHTML
                let club = li.querySelector('.event-title>span>a')
                if (club) club = club.innerHTML
                let artists = li.querySelector('.bbox>div')
                if (artists) artists = artists.innerHTML.split(', ')
                if (event) return { date, event, artists, club }
            }).filter(e => e != null)

        )
        writeJson(events)
        // writeJson(events)

        return events
    }
    catch (err) {
        return err
    }

}

function writeJson(jsonObj) {
    var jsonContent = JSON.stringify(jsonObj);
    fs.writeFile("events.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
}