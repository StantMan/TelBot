const TelegramBot = require('node-telegram-bot-api');
const _ = require ('lodash')
const os = require('os')
const fs = require('fs')
const request = require('request')
const bot = new TelegramBot('593522958:AAEGr2j398OfhAKSudigzuLpDyHkYofgTFA', {polling: true});
const KB = {
    currency: 'Курс валюты',
    picture: 'Картинка',
    cat: 'Котик',
    car: 'Машина',
    back:'Назад'
}
const PicScrs = {
    [KB.cat]: [
      'Jamuevna.jpg',
      'Belly.jpg'
    ],
    [KB.car]: [
      'car1.png',
      'car2.jpg',
      'car3.jpg'
    ]
  }
bot.onText(/\/start/, msg => {
    sendGreeting(msg)
})
bot.on('message', msg => {
    switch (msg.text){
        case KB.picture:
            sendPictureScreen(msg.chat.id)
            break
        case KB.currency:
            sendCurrencyScreen(msg.chat.id)
            break
        case KB.back:
            sendGreeting(msg, false)
            break
        case KB.car:
        case KB.cat:
            sendPictureByname(msg.chat.id, msg.text)
            break
    }
})
bot.on('callback_query', query => {
//console.log(JSON.stringify(query,null, 2))
const base = query.data
const symbol = 'RUB'
bot.answerCallbackQuery({
    callback_query_id: query.id, 
    text: `Вы выбрали: ${base} `
})
request(`http://api.fixer.io/latest?symbols=${symbol}&base=${base}`, (error, response, body) => {
    if(error) throw new Error(error)
    if(response.statusCode === 200){
        const currencyData = JSON.parse(body)
        //console.log(currencyData)
        const html = `<b>1 ${base}</b>-<em>${currencyData.rates[symbol]}${symbol}</em>`
        bot.sendMessage(query.message.chat.id, html, {
            parse_mode: 'HTML'
        })
    }
})
})
function sendPictureScreen(chatId) {
    bot.sendMessage(chatId, 'Выберите тип картинки', {
        reply_markup: {
            keyboard: [
                [KB.car, KB.cat],
                [KB.back]
            ]
        }
    })
}
function sendGreeting(msg, sayHello = true){
        const text = sayHello
        ? `Приветствую Вас, ${msg.from.first_name}\nВыберите, что вы хотите посмотреть...`
        : `Что вы хотите сделать?`

    bot.sendMessage(msg.chat.id, text,{
        reply_markup: {
            keyboard: [
             [KB.currency, KB.picture]       
         ]
        }     
     })
}
function sendPictureByname(chatId, picName){
    const srcs = PicScrs[picName]
    const src = srcs [_.random(0, srcs.length - 1)]
    bot.sendMessage(chatId, 'Загружаю...')
    fs.readFile(`${__dirname}/pictures/${src}`, (error, picture) => {
        if(error) throw new Error(error)
        bot.sendPhoto(chatId, picture).then (() => {
            bot.sendMessage(chatId, 'Отправлено!')
        })
    }) 
    console.log(srcs)
}
function sendCurrencyScreen(chatId){
    bot.sendMessage(chatId, `Выберите тип валюты: `, {
        reply_markup: {
            
           inline_keyboard: [
            [    {
                    text: 'Доллар',
                    callback_data: 'USD'
                }
            ],
            [ 
                {
                     text: 'Евро',
                     callback_data: 'EUR'
                }
            ]
            ],
        }
    })
}
