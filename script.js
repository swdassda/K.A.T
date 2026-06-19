async function enviar(){

    const input = document.getElementById("mensagem");

    const mensagem = input.value;

    if(!mensagem) return;

    const chat = document.getElementById("chat");

    chat.innerHTML += `
        <div>
            Você: ${mensagem}
        </div>
    `;

    input.value = "";

    const resposta = await fetch(
        "SEU_LINK_NGROK_AQUI/ia",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                message:mensagem,
                player:"player1"
            })
        }
    );

    const texto = await resposta.text();

    chat.innerHTML += `
        <div>
            Kathy: ${texto}
        </div>
    `;
}
