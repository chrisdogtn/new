// JavaScript Document mymodule.js
const cheerio = require("cheerio");
// const pLimit = require("p-limit");
let cook;
const regExMatcher = new RegExp(
    "(?<=/r/)(.+?)((?<![^a-zA-Z0-9_\u4e00-\u9fa5])(?=[^a-zA-Z0-9_\u4e00-\u9fa5])|(?<=[^a-zA-Z0-9_\u4e00-\u9fa5])(?![^a-zA-Z0-9_\u4e00-\u9fa5])|$)"
);

const galleryRegEx = new RegExp("\\.redd\\.it(.+?)(?=\\?)");
exports.scrape = async function (options) {
    const data = this.parse(options.mydata)
    const response = await fetch("https://old.reddit.com/api/login/Chrisdogtn", {
        headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        referrer: "https://old.reddit.com/",
        referrerPolicy: "unsafe-url",
        body: "op=login-main&user=Chrisdogtn&passwd=kumadig123!&api_type=json",
        method: "POST",
        mode: "cors",
        credentials: "include",
    });

    let json = await response.json();
    cook = json.json.data.cookie;

    await start(data)
    return data

}


async function start(urls) {
    for (i in urls) {
        regLinks = [];
        galleryLinks = [];
        pageNum = 1;
        packName = urls[i].match(regExMatcher)[0];

        await puppetBoi(urls[i]);
    }
}

async function puppetBoi(url) {
    let num2 = await fetch(url, {
        headers: {
            cookie: "csv=2; reddit_session=" + cook,
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
    });
    const html = await num2.text();

    await cheerioData(html);
}

async function cheerioData(data) {
    console.log(
        "------- Grabbing Subreddit " + packName + " - " + pageNum + " -------"

    );
    const $ = cheerio.load(data);
    let post = $(".thing");
    let postTitle = $("p .title");

    for (let i = 0; i < post.length; i++) {
        let link = post[i].attribs["data-url"];
        let pt = postTitle[i].children[0].data;
        if (link && link.includes("reddit.com/gallery")) {
            console.log("***GRABBING POST : " + pt);
            console.log("GALLERY LINK - " + link);
            galleryLinks.push(link);
        } else if (link && !link.includes("comments")) {
            console.log("***GRABBING POST : " + pt);
            console.log(link);
            regLinks.push(link);
        }
    }
    let nextLink = $("span .next-button a")[0];
    if (nextLink) {
        let next = nextLink.attribs.href;
        pageNum++;
        await puppetBoi(next);
    } else {
        console.log("End of Subreddit");
        console.log(
            "Found " +
            regLinks.length +
            " Images & " +
            galleryLinks.length +
            " Galleries"
        );
        await getGalleries(galleryLinks);
        await con(regLinks);
    }
}
async function getGalleries(galleryLinks) {
    console.log("Processing Galleries");
    for (let i = 0; i < galleryLinks.length; i++) {
        let num2 = await fetch(galleryLinks[i], {
            headers: {
                cookie: "csv=2; reddit_session=" + cook,
            },
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
        });
        let html = await num2.text();
        const $ = cheerio.load(html);
        let images = $("figure a");
        let title = $("._2SdHzo12ISmrC8H86TgSCp").text();
        console.log(
            "Grabbing gallery from post " +
            title +
            " - " +
            (parseInt(galleryLinks.length) - parseInt(i)) +
            " Galleries Left"
        );
        for (let i = 0; i < images.length; i++) {
            if (images[i].attribs) {
                let check = images[i].attribs.href.match(galleryRegEx);
                if (check && check.length > 0) {
                    imageLink = check[0];
                    console.log("Gallery Image grabbed - " + imageLink);
                    regLinks.push(imageLink);
                }
            } else {
                console.log("No link?");
            }
        }
    }
    console.log(
        "FINISHED! Found " + regLinks.length + " Total Links!"
    );
}