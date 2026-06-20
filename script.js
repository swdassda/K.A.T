const chat = document.getElementById("chat");
const sendBtn = document.getElementById("send");
const messageInput = document.getElementById("message");
const imageInput = document.getElementById("imageInput");
const typing = document.getElementById("typing");

let imagemBase64 = null;

imageInput.addEventListener("change", e => {

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = () => {

        imagemBase64 = reader.result.split(",")[1];

        criarBolha(
            "📷 Imagem anexada",
            "user"
        );
    };

    reader.readAsDataURL(file);
});

function criarBolha(texto, tipo){

    const div = document.createElement("div");

    div.className = `bubble ${tipo}`;

    div.textContent = texto;

    chat.appendChild(div);

    scrollFinal();

    return div;
}

function scrollFinal(){

    chat.scrollTop = chat.scrollHeight;
}

async function enviar(){

    const msg = messageInput.value.trim();

    if(!msg && !imagemBase64)
        return;

    criarBolha(msg || "[imagem]", "user");

    messageInput.value = "";

    typing.hidden = false;

    const resposta = criarBolha("", "bot");

    const response = await fetch(
        "https://3c7e-2804-2484-991b-3400-8bdc-cb27-2b5f-a1e3.ngrok-free.app/ia",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                message:msg,
                image:imagemBase64,
                internet:true,
                player:"player1"
            })
        }
    );

    typing.hidden = true;

    const reader = response.body.getReader();

    const decoder = new TextDecoder();

    while(true){

        const {done,value} =
            await reader.read();

        if(done)
            break;

        resposta.textContent +=
            decoder.decode(value);

        scrollFinal();
    }

    imagemBase64 = null;
}

sendBtn.addEventListener("click", enviar);

messageInput.addEventListener(
    "keypress",
    e=>{
        if(e.key==="Enter")
            enviar();
    }
);
