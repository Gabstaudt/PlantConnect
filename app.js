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
var umidadeArray = [0,0,0,0,0]
//criaçao do rafico
var linha1 =  new Chart(document.getElementById("pressureLineChart"),{
    type: 'line',
    data: {
        labels: [5,4,3,2,1],
        datasets: [{
            label: 'Vendas',
            data: umidadeArray,
            borderColor: 'green',
            borderWidth: 3,
            tension: 0,
            fill: false
        }]
    },
    options: {
        annotation: {
            annotations: [
                {
                    type: 'label', // Tipo de anotação
                    backgroundColor: 'black', // Cor de fundo do rótulo
                    content: `Último valor: ${umidadeArray[4]}`, // Texto do rótulo
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    position: {
                        x: '50%', // Posição horizontal (50% da largura do gráfico)
                        y: '145%'  // Posição vertical (acima do eixo x)
                    },
                    xAdjust: 10, // Ajusta a posição no eixo X
                    yAdjust: 10, // Ajusta a posição no eixo Y (distância para baixo)
                }
            ]
        },
        scales: {
            y: {
                beginAtZero: true,
                min: 1000,
                max: 4095,
            }
        }
    }
}) 


//funçao que faz requisiçao pro servidor para obter os dados
async function GraficoUimidade(){
    var data = await fetch('http://localhost:3000/getData',{
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