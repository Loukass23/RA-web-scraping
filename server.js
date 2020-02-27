const pupeteer = require('puppeteer')
const express = require('express');
const fs = require('fs');
const bodyParser = require("body-parser");

const app = express();
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Express server running on port ${port}`)
});

app.post('/events/:type', async (req, res) => {
    const { countryCode, city } = req.body
    const path = `./cityEvents/${city}.json`
    const type = req.params.type
    console.log('type :', type);
    try {
        if (!fs.existsSync(path)) {
            const events = await scrapRA(countryCode, city)
            const data = await typeControler(events, type)
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(data));
        }
        else {
            fs.stat(path, async (err, stats) => {
                var mtime = stats.mtime;

                const now = new Date();
                const diff = new Date(now - mtime).getHours();
                // res.json(require(path));
                if (diff <= 12) {
                    const events = require(path)
                    const data = await typeControler(events, type)
                    res.send(data);
                }
                else {
                    const events = await scrapRA(countryCode, city)
                    const data = await typeControler(events, type)
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(data));
                }
            });
        }
    } catch (error) {
        res.send(error)
    }
})

const typeControler = async (events, type) => {
    switch (type) {
        case 'all': return events
        case 'random': return events[getRandomInt(events.length)]
        default: return events
    }
}


const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
}


async function scrapRA(countryCode, city) {
    try {
        const url = `https://www.residentadvisor.net/events/${countryCode}/${city}`
        const browser = await pupeteer.launch({ args: ['--no-sandbox'] })
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

        writeJson(events, city)

        return events
    }
    catch (err) {
        return err
    }

}

function writeJson(jsonObj, city) {
    var jsonContent = JSON.stringify(jsonObj);
    fs.writeFile(`./cityEvents/${city}.json`, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
}