const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const request = require('request')
const moment = require('moment')
const schedule = require('node-schedule');

const BING_URL = 'https://cn.bing.com/'
const IMAGE_DIR = path.resolve('./images')

function loadPage(url) {
    return new Promise((resolve, reject) => {
        request(url, function(err, response, body) {
            if(err) {
                reject('下载网页失败')
            } else {
                resolve(body)
            }
        });
    })
}

function extractImageUrl(body) {
    const $ = cheerio.load(body)
    const url = $('#bgImgProgLoad').data('ultra-definition-src')
    // let url = ''
    // if(/(.*?jpg)/.test(imgStr)) {
    //     url = RegExp.$1
    // }
    return url
}

async function dowoloadImage(url) {
    const distName = 'temp.jpg'
    const distPath = IMAGE_DIR + '/' + distName
    await request(url).pipe(fs.createWriteStream(distPath))
    return distPath
}

function replace(tempPath) {
    const defautPath = IMAGE_DIR + '/default.jpg'
    const newPath = IMAGE_DIR + '/' + moment().format('YYYY-MM-DD') + '.jpg'
    if(fs.existsSync(defautPath)) {
        fs.renameSync(defautPath, newPath)
    }
    fs.renameSync(tempPath, defautPath)
}

async function main() {
    try {
        const body = await loadPage(BING_URL)
        const url = extractImageUrl(body)
        if(!url) {
            return console.log('提取图片地址失败')
        }
        const tempPath = await dowoloadImage(BING_URL + url)
        replace(tempPath)
    } catch (error) {
        console.log(error)
    }
}

main()
const task = schedule.scheduleJob('0 0 2 * * *', () => {
    main()
})

// task.cancel()