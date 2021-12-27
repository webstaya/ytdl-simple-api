const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
var serveIndex = require('serve-index');
const COOKIE = "GPS=1; YSC=yv-MFUnVO7M; VISITOR_INFO1_LIVE=puNALCZRKCU; CONSISTENCY=AGDxDeOTjvk7RLa78P5KzwVCN6INKovK8cNX2qwj0C_fUV4fwE2l90c6qR1-3jUCdClV59rYBpwxuCH1yRO56a8F3xnPiJFWfYtxPFcqSBXUsj_KlMm2h60m3Cgy5VMImdVFFvCoM3cr3Jy8SDXYPjQ; SID=Cwjp4X0LcDWQcxQkeC0RmQFP6ado5-XJpieRVOjHFjkeLuqwx_uJute3X1MZfpRaccwD-w.; __Secure-1PSID=Cwjp4X0LcDWQcxQkeC0RmQFP6ado5-XJpieRVOjHFjkeLuqwDo8mo9y4YUelACdTLePDng.; __Secure-3PSID=Cwjp4X0LcDWQcxQkeC0RmQFP6ado5-XJpieRVOjHFjkeLuqwvOKAYoj4x-Jq1VlHKe-Vag.; HSID=A9ZAk537AbZybfSUE; SSID=AwkSMERBc6gJOyue7; APISID=YYpNLuXD5YRtRdz5/AGHdcuoNJDrbs3efo; SAPISID=gDFNeREkL-mqaI6o/AiNEJYO0VV2nFKhEY; __Secure-1PAPISID=gDFNeREkL-mqaI6o/AiNEJYO0VV2nFKhEY; __Secure-3PAPISID=gDFNeREkL-mqaI6o/AiNEJYO0VV2nFKhEY; LOGIN_INFO=AFmmF2swRQIhALV4jXNd1g4TDmOT_nyjsV91ro7zww9M-cybTTdk29l6AiB8vtLmmE0dzLotAHKuGx3lapMUeZ_G6uNu5FGcFu7dzA:QUQ3MjNmemNjT3RhaXZZSUZxWGxxb1d5Xzg5NVREZVJHeXRZMmh0NV9rOUdqdnFZNHRMa1g2ZVg1enZ1eURleHBRM3VaOWo4WFpiT294dkliYjF5Wk1wdFJtclhOXy1kTTQ1WjdvUDlPMlBfRTRuQnJfSmU3ZUJnaVh1MjBQMnBYbzFNV2ZLZXB6a2NmYUlUSVlBWml5WlVjS0ptWlBYa0tKWEE5M3NCUTI4X0xMTzRKWExGUGJiR3Z0VmpHRVQ1VTBnNXlIT0N4VlZvbVdFYmQ3X3lHU3hBa01scHRYU0RYUQ==; PREF=f4=4000000&tz=America.Sao_Paulo&f6=40000000; SIDCC=AJi4QfEXEFSKytJk84Q8a4xkNWZk_yFiLXFjRiommRpKX6KWoc9btmZwGObuOvkVvGQo-L-v; __Secure-3PSIDCC=AJi4QfEWblOTHlsFNYrZkymLLVMf5SW0AAtVqHtGBz-VrYkbf895za6riX6NP7UOiBAIKMet"
const getRandom = (ext) => {return `${Math.floor(Math.random() * 10000)}${ext}`}
const myhost = (req) => { return `http://${req.headers.host}`}
const porta = process.env.PORT || 3000

app.set('json spaces', 4)
app.use(express.static(__dirname + "/"))
app.use('/public', serveIndex(__dirname + '/public'));

app.listen(porta, function(){
    console.log("Слушаем порт ", porta)
    if (porta==3000){console.log('Работает локально на http://localhost:3000')}
});
app.get('/url', function(req, res){
    res.send(('Базовый адрес сайта: '+ myhost(req)))
})
app.get('/', function(req, res){
    res.send(`
    <center>
    <br>
    <h2>Как использовать...</h2>
    <hr>
    <p><b>Видео</b> = ${myhost(req)}/<b>video?url=</b>ссылка-на-медиа</p><br>
    <p><b>Музыка</b> = ${myhost(req)}/<b>audio?url=</b>ссылка-на-медиа</p><br>
    <p><b>Сведения</b> = ${myhost(req)}/<b>info?url=</b>ссылка-на-медиа</p><br>
    <br>
    <h3><b>* возвращается из API в json</b></h3>
    <hr>
    <br>
    <h5><b>Разработка Éricky Thierry</b></h5>
    <h5><b>Перевод Иван К.</b></h5>
    <a href="${myhost(req)}/public/">Архив</a>
    </center>
    `)
})
app.get('/audio', function(req, res){
    
    urlVideo = req.query.url
    console.log('Аудио ', urlVideo)
    if (urlVideo!=undefined && urlVideo.length > 3){
        try {
            const video1 = ytdl(urlVideo, {requestOptions: {headers: {cookie: COOKIE}}})
            
            var archiveName = getRandom('')
            
            video1.on('error', err => {
                console.log('Ошибка: ', err);
                res.json({'sucess': false, "error": err.message});
            });
            
            ffmpeg(video1)
            .withAudioCodec("libmp3lame")
            .toFormat("mp3")
            .saveToFile(`${__dirname}/public/${archiveName}.mp3`)
            .on('end', () => {
                res.json({'sucess': true, 'file': `${myhost(req)}/archive/?archive=${archiveName}.mp3`});
                })
            .on('error', function(err){
                res.json({'sucess': false, "error": err.message});           
            });
            
        
        } catch (e) {
            console.log('Ошибка ', e)
            res.json({'sucess': false, "error": e.message});
        }
        
    }else{
        res.json({'sucess': false, "error": 'sem url'});
    }
    
});

app.get('/video', function(req, res){
    
    urlVideo = req.query.url
    console.log('Видео ', urlVideo)
    if (urlVideo!=undefined && urlVideo.length > 3){
        try {
            var archiveName = getRandom('')
            const video2 = ytdl(urlVideo, {requestOptions: {headers: {cookie: COOKIE}}})
            
            
            
            video2.on('error', err => {
                console.log('Ошибка: ', err);
                res.json({'sucess': false, "error": err.message});
            });
            
            
            video2.on('end', () => {
                res.json({'sucess': true, "file": `${myhost(req)}/archive/?archive=${archiveName}.mp4`});
              });
            
            video2.pipe(fs.createWriteStream(`${__dirname}/public/${archiveName}.mp4`))
        
        } catch (e) {
            console.log('Ошибка ', e)
            res.json({'sucess': false, "error": e.message});
        }
        
    }else{
        res.json({'sucess': false, "error": 'Нет url'});
    }
    
});

app.get('/archive', function(req, res){
    archiveName = req.query.archive
    console.log('Загрузка файла ', archiveName)
    if (archiveName != undefined && fs.existsSync(`${__dirname}/public/${archiveName}`)){
        res.sendFile(`${__dirname}/public/${archiveName}`)
    }else{
        res.json({'sucess': false, "error": 'Нет url'});
    }
})

app.get('/info', function(req, res){
    link = req.query.url
    console.log('Сведения ', link)
    if (link != undefined && link.length > 2){
        try {
            ytdl.getInfo(link, {requestOptions: {headers: {cookie: COOKIE}}}).then(info =>{
                
                res.json({
                    'sucess': true,
                    "title" : info.videoDetails.title,
                    "videoid" : info.videoDetails.videoId,
                    "thumb": info.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url,
                    'duration':info.videoDetails.lengthSeconds,
                    'likes' : info.videoDetails.likes,
                    'deslikes' : info.videoDetails.dislikes
                })
            
            }).catch(error =>{
                console.log('Ошибка: ', error);
                res.json({'sucess': false, "error": error.message});
            })
            
        
        } catch (e) {
            console.log('Ошибка ', e)
            res.json({'sucess': false, "error": e.message});
        }
    }else{
        res.json({'sucess': false, "error": 'Нет url'});
    }
})
