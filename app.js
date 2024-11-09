// Função para simular envio e exibir o popup com o resultado
function enviarClassificacao() {
    const popup = document.getElementById("result-popup");
    const resultadoTexto = document.getElementById("classification-result");
    resultadoTexto.textContent = "A planta parece saudável."; 
    popup.classList.remove("hidden");
}

// Função para fechar o popup
function fecharPopup() {
    const popup = document.getElementById("result-popup");
    popup.classList.add("hidden");
}

//adição de imagem ao canvas
var canvas = document.getElementById('plantLive')
var ctx = canvas.getContext('2d');
var img = new Image()
img.src = '/representacao.jpg'
img.onload = () => {
    // Define a posição e o tamanho para desenhar a imagem
    const x = 0;
    const y = 0;
    const width = canvas.width;
    const height = canvas.height;
  
    // Desenha a imagem no contexto 2D do canvas
    ctx.drawImage(img, x, y, width, height);
};
//variavel que guarda os 5 valores de umidade 
var umidadeArray = []
//criaçao do rafico
var linha1 =  new Chart(document.getElementById("pressureLineChart"),{
    type: 'line',
    data: {
        labels: ["10s","9s","8s","7s","6s","5s","4s","3s","2s","1s"],
        datasets: [{
            label: 'Umidade',
            data: umidadeArray,
            borderColor: 'green',
            borderWidth: 3,
            tension: 0,
            fill: false,
            pointRadius: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                min: 1000,
                max: 4095,
            }
        },
        animation: {
            duration: 0  // Define a duração da animação como 0, desativando a animação
          }
    }
}) 


//funçao que faz requisiçao pro servidor para obter os dados
async function GraficoUimidade(){
    var data = await fetch('https://esp32-server-production.up.railway.app/getData',{
        headers:{
            'Content-Type': 'application/json'
        }
    })
    if(data.ok){
        //atualiza os dados no grafico
        umidadeArray = await data.json()
        umidadeArray = umidadeArray.valor
        linha1.data.datasets[0].data = umidadeArray;
        linha1.update()
    }
     
}

//puxa os dados do servidor a cada 1 seg
setInterval( GraficoUimidade,1000)