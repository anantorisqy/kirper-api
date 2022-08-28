const express = require('express');
const app = express();
const expressEjsLayout = require('express-ejs-layouts')
const cheerio = require('cheerio');
const Axios = require('./tools');
const fs = require('fs-extra')
const path = require('path')
const {
    JSDOM: JSDOM
} = require("jsdom");
const { default: axios } = require('axios');


app.use('/', express.static(path.join(__dirname, 'html')))
//EJS
app.set('view engine','ejs');
app.use(expressEjsLayout);
//BodyParser
app.use(express.urlencoded({extended : false}));
//express session

app.get('/', async(req,res)=>{
var content = fs.readFileSync('./html/index.html', 'utf8')
res.send(content)
})
app.get('/docs', async(req,res)=>{
    let data = fs.readFileSync('./html/index.html', 'utf8')
res.send(data)
})
app.get('/:plug', async(req,res)=>{
    try {
    const plug = req.params.plug;

    const response = await Axios(`/${plug}`);
    const $ = cheerio.load(response.data);
    const element = $('.postarea');

    let obj = {};

    let {
        document: t
    } = await new JSDOM(response.data).window,r = t.querySelectorAll("#readerarea p img"),
    temp_image;

    for (img of (temp_image = [], r)) temp_image.push(img.src);


    obj.title = $(element).find('.entry-title').text();
    obj.series = {
        name: $(element).find('.allc a').text(),
        endpoint: `https://kirper.herokuapp.com/${$(element).find('.allc a').attr('href').replace('https://kiryuu.id/', '')}`
    }
    obj.download = $(element).find('.dlx.r a').attr('href');
    obj.nextprev = {
        prev: $(element).find('.nextprev:last-child a:first-child').attr('href'),
        next: $(element).find('.nextprev:last-child a:last-child').attr('href')
    }
    obj.image = temp_image
    obj.komentar = list_komen

    res.send(obj)
} catch (err) {
            
    res.send({status: 200, message: err.message});

};

})


app.get('/genres/:plug', async(req,res)=>{
    try {
    const plug = req.params.plug;

    const response = await Axios(`/genres/${plug}`);
    const $ = cheerio.load(response.data);
    const element = $('.wrapper .postbody')

    let manga_list = [];
    let title, link;

    $(element).find('.bixbox .listupd .bs').each((i, e) => {
  
  
        title = $(e).find('img').attr('title');
        link = {
            endpoint: `https://kirper.herokuapp.com/${$(e).find('a').attr('href').replace('https://kiryuu.id/', '')}`,
            url: $(e).find('a').attr('href'),
            thumbnail: $(e).find('img').attr('src'),
            chapter: $(e).find('.epxs').attr('textContent')
        };

        manga_list.push({
            title,
            link
        });

      });
      res.send(manga_list)

    } catch (err) {
            
        res.send({status: 200, message: err.message});

    };


})
app.get('/manga/:plug', async(req,res)=>{
    try {
    const plug = req.params.plug;

    const response = await Axios(plug);
    const $ = cheerio.load(response.data);
    const element = $('.postbody');

    let obj = {};

    let temp_genre = [];
        $(element).find('.seriestugenre > a').each((i, e) => {
            temp_genre.push({
                name: $(e).text(), 
                url: $(e).attr('href'),
                endpoint: `https://kirper.herokuapp.com/${$(e).attr('href').replace('https://kiryuu.id/', '')}`
            });
        });

    let eplister = [];
        $(element).find('.clstyle li .chbox .eph-num a').each((i,e) => {
            eplister.push({
                name: $(e).find('.chapternum').text(),
                url: $(e).attr('.href'),
                endpoint: `https://kirper.herokuapp.com/${$(e).attr('href').replace('https://kiryuu.id/', '')}`
            })
        })
    
    obj.title = $(element).find('.thumb img').attr('title');
    obj.thumb = $(element).find('.thumb img').attr('src');
    obj.rating = $(element).find('.rating.bixbox .num').text()
    obj.sinopsis = $(element).find('.entry-content p').text()
    obj.chapter = {
       awal: {
            name: $(element).find('.lastend .inepcx a .epcur.epcurfirst').text(),
            endpoint: `https://kirper.herokuapp.com/${$(element).find('.inepcx:first-child a').attr('href').replace('https://kiryuu.id/', '')}`
             },
       akhir: {
            name: $(element).find('.lastend .inepcx a .epcur.epcurlast').text(),
            endpoint: `https://kirper.herokuapp.com/${$(element).find('.inepcx:last-child a').attr('href').replace('https://kiryuu.id/', '')}`
             }
    }
    obj.info = {
        status: $(element).find('.infotable tr:nth-child(1) td:last-child').text(),
        type: $(element).find('.infotable tr:nth-child(2) td:last-child').text(),
        released: $(element).find('.infotable tr:nth-child(3) td:last-child').text(),
        author: $(element).find('.infotable tr:nth-child(4) td:last-child').text(),
        artist: $(element).find('.infotable tr:nth-child(5) td:last-child').text(), 
        serial: $(element).find('.infotable tr:nth-child(6) td:last-child').text(),
        postby: $(element).find('.infotable tr:nth-child(7) td:last-child').text().trim(),
        update: $(element).find('.infotable tr:nth-child(8) td:last-child').text().trim(),
        genre: temp_genre
    }
    obj.list_episode = eplister

    res.send(obj)
} catch (err) {
            
    res.send({status: 200, message: err.message});

};

})
app.get('/popular', async(req,res)=>{
    try {
    const response = await Axios('/')
    const $ = cheerio.load(response.data);
    const element = $('.hotslid');

    /* find n each data */
    let rekom = [];
    let title, link;

    $(element).find('.bixbox.hothome.full > .listupd .bs .bsx').each((i, e) => {

        title = $(e).find('img').attr('title');
        link = {
            endpoint: $(e).find('a').attr('href').replace('https://kiryuu.id/', ''),
            url: $(e).find('a').attr('href'),
            thumbnail: $(e).find('img').attr('src')
        };

        rekom.push({
            title,
            link
        });
       
    });
    res.send(rekom)
} catch (err) {
            
    res.send({status: 200, message: err.message});

};
})
app.get('/list', async(req,res)=>{

    try {

    const response = await Axios('/manga');
    const $ = cheerio.load(response.data)
    const element = $('.wrapper .postbody')

    let manga_list = [];
    let title, link;

    $(element).find('.bixbox .mrgn .listupd .bs').each((i, e) => {
  
  
        title = $(e).find('img').attr('title');
        link = {
            url: $(e).find('a').attr('href'),
            thumbnail: $(e).find('img').attr('src'),
            chapter: $(e).find('.epxs').attr('textContent')
        };

        manga_list.push({
            title,
            link
        });

      });
      res.send(manga_list)
    } catch (err) {
            
        res.send({status: 200, message: err.message});

    };
    })
app.get('/search/:plug', async(req,res)=>{

    try {

    const plug = req.params.plug;
   
  
    const response = await Axios(`/?s=${plug}`)
    const $ = cheerio.load(response.data);
    const element = $('.wrapper .postbody');
  
        /* Scrap Data */
        let anime_list = [];
        let title, link;
  
        $(element).find('.bixbox > .listupd .bs').each((i, e) => {
  
  
          title = $(e).find('img').attr('title');
          link = {
              endpoint: `https://kirper.herokuapp.com/${$(e).find('a').attr('href').replace('https://kiryuu.id/', '')}`,
              url: $(e).find('a').attr('href'),
              thumbnail: $(e).find('img').attr('src'),
              chapter: $(e).find('.epxs').attr('textContent')
          };
  
          anime_list.push({
              title,
              link
          });
  
        });
        res.send(anime_list)
     
    } catch (err) {
            
        res.send({status: 200, message: err.message});

    };
       
  })
  
app.get('/homepage', async(req,res)=>{
    try {
    const response = await axios.get(`https://kiryuu.id/`);
    const $ = cheerio.load(response.data);
    const element = $('.wrapper .postbody');
        console.log($)
    /* find n each data */
    let rekom = [];
    let title, link;

    $(element).find('.bixbox > .listupd > .utao > .uta').each((i, e) => {

        title = $(e).find('img').attr('title');
       
        link = {
            endpoint: $(e).find('a').attr('href').replace('https://kiryuu.id/', ''),
            url: $(e).find('a').attr('href'),
            thumbnail: $(e).find('img').attr('src'),
            chapter: [
              $(e).find('ul').find('li:nth-child(1)').find('a').attr('href'),
              $(e).find(`ul li:nth-child(2) a`).attr('href'),
              $(e).find('ul li:nth-child(3) a').attr('href')
            ]
            
            
        };
      
      
        rekom.push({
            title,
            link
        });
       
    });
    res.send(rekom)
} catch (err) {
            
    res.send({status: 200, message: err.message});

};
})

const PORT = process.env.PORT || 80; 
app.listen(PORT, async () => {

    console.log('Listening on PORT ' + PORT);

});
