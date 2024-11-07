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


document.addEventListener("DOMContentLoaded", function () {
    // Gráfico de Gauge para Temperatura
    new Chart(document.getElementById("temperatureGauge"), {
        type: "doughnut",
        data: {
            labels: ["Temperatura"],
            datasets: [{
                data: [28.23, 50 - 28.23],
                backgroundColor: ["#4CAF50", "#e0e0e0"],
            }],
        },
        options: { circumference: 180, rotation: 270, cutout: "80%", plugins: { tooltip: { enabled: false } } }
    });

    // Gráfico de Gauge para Umidade
    new Chart(document.getElementById("humidityGauge"), {
        type: "doughnut",
        data: {
            labels: ["Umidade"],
            datasets: [{ data: [42.72, 100 - 42.72], backgroundColor: ["#A5D6A7", "#e0e0e0"] }],
        },
        options: { circumference: 180, rotation: 270, cutout: "80%", plugins: { tooltip: { enabled: false } } }
    });

    // Gráfico de Linha para Pressão
    new Chart(document.getElementById("pressureLineChart"), {
        type: "line",
        data: { labels: ["14:13", "14:14"], datasets: [{ label: "Pressão", data: [926.37, 926.4], borderColor: "#4CAF50", tension: 0.1 }] },
        options: { scales: { x: { display: true }, y: { display: true } } }
    });

    // Gráfico de Linha para Altitude
    new Chart(document.getElementById("altitudeLineChart"), {
        type: "line",
        data: { labels: ["14:13", "14:14"], datasets: [{ label: "Altitude", data: [749.85, 750.0], borderColor: "#A5D6A7", tension: 0.1 }] },
        options: { scales: { x: { display: true }, y: { display: true } } }
    });
});

//função que faz a requisição e coloca os dados no grafico
async function getDataPlant(){
    //url da api feita em python
    urlApi = ''
    //requisição por API fetch
    const dataRequest = null;
    //objeto que guardara os dados obtidos após feito a requisição
    var plantData = {}
}
//função que faz a requisição obtem os frames
async function getFramePlant(){
       //url da api feita em python
       urlApi = ''
       //requisição por API fetch
       const dataRequest = null;
       //objeto que guardara os frames de imagnes obtidos após feito a requisição
       var plantData = {} 
}
