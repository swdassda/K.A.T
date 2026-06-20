const chat = document.getElementById("chat");
const chatList = document.getElementById("chatList");

const sendBtn = document.getElementById("send");
const messageInput = document.getElementById("message");
const imageInput = document.getElementById("imageInput");

const newChatBtn = document.getElementById("newChat");

const usernameElement =
document.getElementById("username");

const editUser =
document.getElementById("editUser");

const API_URL =
"https://zachary-unslated-ejectively.ngrok-free.dev/ia";

let chats = {};
let chatAtual = null;
let imagemBase64 = null;
let gerandoResposta = false;

/* =========================
   USUÁRIO
========================= */

let username =
localStorage.getItem("username")
|| "Usuário";

usernameElement.textContent =
username;

editUser.addEventListener("click", ()=>{

    const novo =
    prompt(
        "Digite seu nome:",
        username
    );

    if(!novo) return;

    username = novo;

    usernameElement.textContent =
    novo;

    localStorage.setItem(
        "username",
        novo
    );

});

/* =========================
   SALVAR
========================= */

function salvar(){

    localStorage.setItem(
        "kathyChats",
        JSON.stringify(chats)
    );

}

/* =========================
   SCROLL
========================= */

function scrollFinal(){

    chat.scrollTop =
    chat.scrollHeight;

}

/* =========================
   BOLHAS
========================= */

function criarBolha(
    texto,
    tipo
){

    const div =
    document.createElement("div");

    div.className =
    `bubble ${tipo}`;

    div.textContent =
    texto;

    chat.appendChild(div);

    scrollFinal();

    return div;
}

/* =========================
   SIDEBAR
========================= */

function atualizarSidebarAtiva(){

    document
    .querySelectorAll(".chat-item")
    .forEach(item=>{

        item.classList.remove(
            "active"
        );

        if(
            item.dataset.id ===
            chatAtual
        ){

            item.classList.add(
                "active"
            );

        }

    });

}

function criarItemChat(id){

    const item =
    document.createElement("div");

    item.className =
    "chat-item";

    item.dataset.id =
    id;

    const nome =
    document.createElement("span");

    nome.textContent =
    chats[id].nome;

    const removeBtn =
    document.createElement("button");

    removeBtn.className =
    "delete-chat";

    removeBtn.textContent =
    "🗑";

    removeBtn.addEventListener(
        "click",
        (e)=>{


            if(gerandoResposta){
                alert(
                    "Aguarde a resposta terminar."
                );
                return;
            }

            e.stopPropagation();

            const confirmar =
            confirm(
                "Remover esta conversa?"
            );

            if(!confirmar)
                return;

            delete chats[id];

            item.remove();

            if(chatAtual === id){

                chat.innerHTML = "";

                const ids =
                Object.keys(chats);

                if(ids.length){

                    abrirChat(ids[0]);

                }else{

                    novaConversa();

                }
            }

            salvar();
        }
    );

    item.appendChild(nome);

    item.appendChild(
        removeBtn
    );

    item.addEventListener(
        "click",
        ()=>{
            if(gerandoResposta){
                alert(
                    "Aguarde a resposta terminar."
                );
                return;
            }

            abrirChat(id);

        }
    );

    item.addEventListener(
        "dblclick",
        ()=>{

            if(gerandoResposta){
                return;
            }

            const novoNome =
            prompt(
                "Novo nome da conversa:",
                chats[id].nome
            );

            if(!novoNome)
                return;

            chats[id].nome =
            novoNome;

            nome.textContent =
            novoNome;

            salvar();
        }
    );

    chatList.appendChild(item);
}
/* =========================
   NOVA CONVERSA
========================= */

function novaConversa(){

    const id =
    "chat_" + Date.now();

    chats[id] = {

        nome:
        "Nova conversa",

        mensagens:[]
    };

    criarItemChat(id);

    abrirChat(id);

    salvar();
}

/* =========================
   ABRIR CHAT
========================= */

function abrirChat(id){

    chatAtual = id;

    chat.innerHTML = "";

    chats[id]
    .mensagens
    .forEach(msg=>{

        criarBolha(
            msg.texto,
            msg.tipo
        );

    });

    atualizarSidebarAtiva();
}

/* =========================
   CARREGAR HISTÓRICO
========================= */

function carregarChats(){

    const dados =
    localStorage.getItem(
        "kathyChats"
    );

    if(!dados){

        novaConversa();

        return;
    }

    chats =
    JSON.parse(dados);

    chatList.innerHTML = "";

    Object.keys(chats)
    .forEach(id=>{

        criarItemChat(id);

    });

    const primeiro =
    Object.keys(chats)[0];

    abrirChat(primeiro);
}

/* =========================
   IMAGEM
========================= */

imageInput.addEventListener(
    "change",
    e=>{

        const file =
        e.target.files[0];

        if(!file)
            return;

        const reader =
        new FileReader();

        reader.onload =
        ()=>{

            imagemBase64 =
            reader.result
            .split(",")[1];

            criarBolha(
                "📷 Imagem anexada",
                "user"
            );

        };

        reader.readAsDataURL(
            file
        );

    }
);

/* =========================
   ENVIO
========================= */

async function enviar(){

    if(gerandoResposta){
        return;
    }



    const msg =
    messageInput.value.trim();

    if(
        !msg &&
        !imagemBase64
    ){
        return;
    }

    gerandoResposta = true;

    const chatIdEnvio = chatAtual;

    criarBolha(
        msg || "[imagem]",
        "user"
    );

    chats[chatIdEnvio]
    .mensagens
    .push({
        texto:
        msg || "[imagem]",
        tipo:"user"
    });

    salvar();

    messageInput.value = "";

    const resposta =
    chatAtual === chatIdEnvio
    ? criarBolha(
        "● ● ●",
        "bot loading"
    )
    : null;

    try{

        const response =
        await fetch(
            API_URL,
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    message:msg,

                    image:imagemBase64,

                    internet:true,

                    player:"player1",
                   
                    chat_id:chatIdEnvio

                   

                })
            }
        );

        if(!response.ok){

            if(resposta){
                resposta.textContent =
                "Erro ao conectar.";

                resposta.classList.remove(
                    "loading"
                );
            }
            
            return;
        }

        const reader =
        response.body.getReader();

        const decoder =
        new TextDecoder();

        let iniciou =
        false;

        let textoFinal =
        "";

        while(true){

            const {
                done,
                value
            } =
            await reader.read();

            if(done)
                break;

            if(!iniciou){

                if(resposta){

                    resposta.textContent =
                    "";

                    resposta.classList
                    .remove(
                        "loading"
                    );
                }

                iniciou = true;
            }

            const chunk =
            decoder.decode(
                value
            );

            textoFinal +=
            chunk;

            if(
                resposta &&
                chatAtual === chatIdEnvio
            ){
                resposta.textContent =
                textoFinal;
            }

            if(chatAtual === chatIdEnvio){
                scrollFinal();
            }
        }

        chats[chatIdEnvio]
        .mensagens
        .push({
            texto:textoFinal,
            tipo:"bot"
        });

        salvar();
    }
    catch(error){

        console.error(error);

        if(resposta){

            resposta.textContent =
            "Erro ao processar resposta.";

            resposta.classList
            .remove("loading");
        }


    }
    finally{
        imagemBase64 = null;
        gerandoResposta = false;
    }
}

/* =========================
   EVENTOS
========================= */

sendBtn.addEventListener(
    "click",
    enviar
);

messageInput.addEventListener(
    "keypress",
    e=>{

        if(
            e.key === "Enter"
        ){

            enviar();

        }

    }
);

newChatBtn.addEventListener(
    "click",
    ()=>{

        if(gerandoResposta){
            alert(
                "Aguarde a resposta terminar."
            );
            return;
        }

        novaConversa();

    }
);

/* =========================
   START
========================= */

carregarChats();
