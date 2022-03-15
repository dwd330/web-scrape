
const PORT=process.env.PORT||8000
const express = require("express")
const cheerio = require("cheerio")
const axios = require("axios")

//.....................  
const app =express()

//------- url ----------
const vid_url='https://www.yallakora.com/Videos/%D9%81%D9%8A%D8%AF%D9%8A%D9%88%D9%87%D8%A7%D8%AA'
vid_base='https://www.yallakora.com'

const base_url ='https://www.yallakora.com/Match-Center/%D9%85%D8%B1%D9%83%D8%B2-%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA'
const today='#matchesclipAll'//   (defualt) 
//by day format:?date=1/13/2022#days
const todate='?date=' //    (date:mon/dat/year)
const days='#days'
//--------
app.get('/',(req,res)=>{
res.json('welcome to my api this api is used for sports data')
})
 //-------..API handler FUNCTION.. -----
 function apihandler(url,res){

    axios(url)
    .then(response => {
        const html = response.data
        const $ = cheerio.load(html)
        const allmatches = [] 
        var match = []
        $('.mtchObjContainer').each(function () { 
            //get cup name
                const cup= $(this).siblings('.ttl').find('h2').find('a').text()
                $(this).find('li').each(function(){//get basic data
                const teamA =$(this).find('.teamA').find('.teamName').text().replace(/\n/g, '').trim()
                const teamAlogo = $(this).find('.teamA').find('img').attr('src')
                const scoreA= $(this).find('div[class ="matchResult"]>span[class="result LiveTeamA"]').text()
                const teamB = $(this).find('.teamB').find('.teamName').text().replace(/\n/g, '').trim()
                const teamBlogo = $(this).find('.teamB').find('img').attr('src')
                const scoreB=$(this).find('div[class ="matchResult"]>span[class="result LiveTeamB"]').text()
                const time= $(this).find('.matchTime').text().replace(/\n/g, '').trim()
                const week = $(this).find('.week').text().replace(/\n/g, '').trim()
              
                //get goal time and player names
                var teamAplayers=[]
                $(this).find('.teamA').find('.goal.icon-goal').each(function(){
                    const playerA=$(this).find('.player').text().replace(/\n/g, '').trim()
                    const playerAtime=$(this).find('.time').text().replace(/\n/g, '').trim()
                    teamAplayers.push({playername:playerA,scoretime:playerAtime})
                })
                teamAplayers=   Object.assign({}, teamAplayers);
                //....
                var teamBplayers=[]
                $(this).find('.teamB').find('.goal.icon-goal').each(function(){
                    const playerB=$(this).find('.player').text().replace(/\n/g, '').trim()
                    const playerBtime=$(this).find('.time').text().replace(/\n/g, '').trim()
                    teamBplayers.push({playername:playerB,scoretime:playerBtime})
                })
                teamBplayers=   Object.assign({}, teamBplayers);


            match.push({ 
                cup,
                teamA,
                teamAlogo,
                scoreA, 
                teamAplayers,
                teamB,  
                teamBlogo,
                scoreB,
                teamBplayers,
                time,
                week,
                
            }) 

                })
                
             match=   Object.assign({}, match);    
            allmatches.push({  
                cup,
              match
            })  
           
            match=[]
         
        })
       const output= Object.assign({}, allmatches);  
       console.log('out',output)
       res.json(output)

       return output
      
    }).catch(err => console.log(err))
     
 }

//----------------------------------------------------
app.get('/results', (req, res) => {
   ( () => {
    apihandler(base_url+today,res);
 })()
    

})      
//-----------------------------------------------------

app.get('/results/:dateid', (req, res) => {
    var qdate=req.params.dateid
    qdate=qdate.replace('-', '/') 
    apihandler(base_url+todate+qdate+days,res);
})

//-----------------------------------------------
app.get('/videos', (req, res) => {
    axios(vid_url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const allvids = []
            $('.video').each(function () { 
                const link=vid_base+ $(this).find('.link').attr('href')
                var date=$(this).find('.desc').find('.date').text()
                var name =$(this).find('.desc').find('p').text().replace(date, '').trim()
                date=date.replace(/\n/g, '').trim()
                const img= $(this).find('.imageCntnr').find('img').attr('src')
 
                allvids.push({  
                  link,
                  name, 
                  date,
                  img, 
                }) 
              
            })  
           const output= Object.assign({}, allvids);   
            res.json(output)
        }).catch(err => console.log(err))

})
//------------------------

app.listen(PORT,()=>console.log("server running in port",PORT ))
 