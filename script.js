const URL = "https://SEU-NGROK.ngrok-free.app/ia";

let imagemBase64 = null;
let usarInternet = false;

function toggleInternet(){

    usarInternet = !usarInternet;

    const btn = document.getElementById("btnInternet");

    if(usarInternet){

        btn.style.background = "white";
        btn.style.color = "black";

    }else{

        btn.style.background = "#111";
        btn.style.color = "white";
    }
}

function selecionarImagem(){

    document
    .getElementById("imagem")
    .click();
}

document
.getElementById("imagem")
.addEventListener("change", function(e){

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(){

        imagemBase64 =
            reader.result.split(",")[1];

        criarBolha(
            "📷 Imagem anexada",
            "user"
        );
    };

    reader.readAsDataURL(file);
});

function criarBolha(texto,tipo){

    const chat =
        document.getElementById("chat");

    const div =
        document.createElement("div");

    div.className =
        "bolha " + tipo;

    div.textContent = texto;

    chat.appendChild(div);

    chat.scrollTop =
        chat.scrollHeight;

    return div;
}

async function enviarMensagem(){

    const input =
        document.getElementById("mensagem");

    const mensagem =
        input.value.trim();

    if(!mensagem && !imagemBase64)
        return;

    criarBolha(mensagem,"user");

    input.value = "";

    const bolhaBot =
        criarBolha("...", "bot");

    try{

        const response =
            await fetch(URL,{

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                message:mensagem,
                image:imagemBase64,
                internet:usarInternet,
                player:"player1"

            })

        });

        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder();

        bolhaBot.textContent = "";

        while(true){

            const {done,value} =
                await reader.read();

            if(done) break;

            bolhaBot.textContent +=
                decoder.decode(value);

            document
            .getElementById("chat")
            .scrollTop =
            document
            .getElementById("chat")
            .scrollHeight;
        }

    }catch(err){

        bolhaBot.textContent =
            "Erro: " + err;
    }

    imagemBase64 = null;
}

document
.getElementById("mensagem")
.addEventListener("keydown",e=>{

    if(e.key==="Enter")
        enviarMensagem();
});
