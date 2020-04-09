var Botkit = require('botkit');
var request = require("request");
var _ = require("lodash");
var accessToken = process.env.ACCESS_TOKEN;
var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var data = new Date();
var botOuviu;
var globalID;
var localPedido;
var tipoPessoaPedido;
var qtdCafePedido = 0;
var qtdAguaPedido = 0;
var auxPedido = 0
var auxContato = 0;
var auxContratoEoX = 0;
var frasePedido;
var menuContato;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

if (!accessToken) {
    console.log("Deu ruim na chave de acesso");
    process.exit(1);
}

if (!process.env.PUBLIC_URL) {
    console.log("Deu ruim na URL Publica");
    process.exit(1);
}

var controller = Botkit.sparkbot({
    log: true,
    debug: true,
    public_address: process.env.PUBLIC_URL,
    ciscospark_access_token: accessToken,
    webhook_name: process.env.WEBHOOK_NAME,
    stats_optout: true
});

var bot = controller.spawn({});

controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function () {
        console.log("Webhook set up!");
    });
});




controller.hears(['Oi', 'Olá', 'eae', 'salve', 'oi robo'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/) || verificaUser.match(/@hospital.com/)) {
        if (verificaUser.match(/@webex.bot/)) {
            //não faz nada
        } else {
           
            
            bot.reply(message, "Oi, sou o Botagua, de qual dia e hora (escreva assim: dia xx do mês xx às xx horas) você gostaria de ter informações sobre água?");
        }
    } else {
        
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});

//pega o local da reunião e guarda na variável localPedido 
controller.hears(['dia', 'mes', 'hora', 'data', 'horario'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
        if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
            if (verificaUser.match(/@webex.bot/)) {
                //não faz nada
            } else {
                if (menuContato == '1') {
                                consultarContato2S(botOuviu, function (contatoRetornado) {
                        bot.reply(message, contatoRetornado);
                    }}
                
            }
        } else {
            console.log('Severino falou -> ' + "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
            bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
        }
    
});



// Responde a agradecimentos  
controller.hears(['Obrigada', 'Obrigado', 'Valeu', 'Thanks', 'Grato'], 'direct_message,direct_mention', function (bot, message) {
    var verificaUser = message.user;
    if (verificaUser.match(/@2s.com.br/) || verificaUser.match(/@webex.bot/)) {
        globalID = 0;
        auxContato = 0;
        auxContratoEoX = 0;
        auxPedido = 0;
        console.log('Severino falou -> ' + "Estou aqui para ajudar :)");
        bot.reply(message, "Estou aqui para ajudar :)");
    } else {
        console.log('Severino falou -> ' + "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
        bot.reply(message, "Hey humano!\n\nVocê parece ser uma pessoa super legal, mas eu só estou autorizado a falar com o pessoal da 2S.\n\nDesculpe :/");
    }
});


//traz informações sobre o contato escolhido da 2S
function consultarContato2S(nomeRecebido, callback) {
    if (globalID == 5 && menuContato == 1) {
        var XLSX = require('xlsx');
        var workbook = XLSX.readFile('/Volumes/DADOS/Usuarios/bruna.toledo/Contatos2STeste.xlsx');
        var sheet_name_list = workbook.SheetNames;
        var listaCompleta2S = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        var resposta = '';

        auxContato = 0;
        auxPedido = 0;

        console.log('######### Nome que vai ser filtrado -> ' + nomeRecebido);

        var itemfiltrado = _.filter(listaCompleta2S, function (item) {
            var nomeItemFormatted = item.Nome.toUpperCase();
            var nomeRecebidoFormatted = nomeRecebido.toUpperCase();

            if (nomeItemFormatted.indexOf(nomeRecebidoFormatted) > -1) {
                return item
            }
        });

        if (itemfiltrado.length > 0) {
            _.forEach(itemfiltrado, function (item) {
                resposta += "- Nome: " + item.Nome + " - E-mail: " + item.email + " - Ramal: " + item.Ramal + " - Celular: " + item.Celular + " \n\n";
            });
        } else {
            resposta = "Não encontrei nenhum registro desse nome :(\n\nDigite 'menu' para começar de novo.";
        }
        callback(resposta);
    }
}
;

//ACCESS_TOKEN=YjRhMGZlMTMtNzczOS00NDI3LTg5ZjYtOTE0ZDM4M2RkZjRhYzIwZjNhODAtMWQy_PF84_a892a6ed-b823-46b8-8336-847d8f4722ae PUBLIC_URL=http://99173070.ngrok.io node main.js