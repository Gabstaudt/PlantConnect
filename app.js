function openPopup() {
    document.getElementById("projectPopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("projectPopup").style.display = "none";
}
const video = document.getElementById('video');
const predictionText = document.getElementById('prediction');
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        console.log("Câmera acessada com sucesso");
        video.srcObject = stream;
        video.play();  // Garante que a reprodução do vídeo aconteça
    })
    .catch(error => {
        console.error("Erro ao acessar a câmera:", error);
        // Detalhes do erro de câmera
        if (error.name === 'NotFoundError') {
            predictionText.innerText = "Erro: Nenhuma câmera encontrada.";
        } else if (error.name === 'NotAllowedError') {
            predictionText.innerText = "Erro: Permissão de câmera negada.";
        } else if (error.name === 'NotReadableError') {
            predictionText.innerText = "Erro: Câmera em uso ou não disponível.";
        } else {
            predictionText.innerText = "Erro desconhecido ao acessar a câmera.";
        }
    });



// Variáveis 
var umidadeArray = [];
var tempArArray = [];
var umidArArray = [];

// Gráfico de Umidade do Solo
var linha1 = new Chart(document.getElementById("pressureLineChart"), {
    type: 'line',
    data: {
        labels: ["10s","9s","8s","7s","6s","5s","4s","3s","2s","1s"],
        datasets: [{
            label: 'Umidade do Solo',
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
                min: 0,
                max: 100
            }
        },
        animation: {
            duration: 0
        }
    }
});

// Gráfico Temperatura do Ar
var linha2 = new Chart(document.getElementById("tempArAreaChart"), {
    type: 'line',
    data: {
        labels: ["10s","9s","8s","7s","6s","5s","4s","3s","2s","1s"],
        datasets: [{
            label: 'Temperatura do Ar',
            data: tempArArray,
            borderColor: 'orange',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',  
            borderWidth: 3,
            fill: true,  
            pointRadius: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                min: -10, 
                max: 50   
            }
        },
        animation: {
            duration: 0
        }
    }
});

// Gráfico de Umidade do Ar
var linha3 = new Chart(document.getElementById("umidArLineChart"), {
    type: 'line',
    data: {
        labels: ["10s","9s","8s","7s","6s","5s","4s","3s","2s","1s"],
        datasets: [{
            label: 'Umidade do Ar',
            data: umidArArray,
            borderColor: '#89CFF0',
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
                min: 0,
                max: 100
            }
        },
        animation: {
            duration: 0
        }
    }
});


// Gráfico de Linha Combinado 
var combinedChart = new Chart(document.getElementById("combinedChart"), {
    type: 'line',
    data: {
        labels: ["10s", "9s", "8s", "7s", "6s", "5s", "4s", "3s", "2s", "1s"], 
        datasets: [
            {
                label: 'Temperatura do Ar (°C)',
                data: tempArArray,
                borderColor: 'orange',
                borderWidth: 2,
                fill: false,
                pointRadius: 1
            },
            {
                label: 'Umidade do Solo (%)',
                data: umidadeArray,
                borderColor: 'green',
                borderWidth: 2,
                fill: false,
                pointRadius: 1
            },
            {
                label: 'Umidade do Ar (%)',
                data: umidArArray,
                borderColor: '#89CFF0',
                borderWidth: 2,
                fill: false,
                pointRadius: 1
            }
            
        ]
    },
    options: {
        animation: {
            duration: 0
        },
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                max: 100, 
                ticks: {
                    stepSize: 10, 
                    callback: function(value) {
                        return value; 
                    }},
                title: {
                    display: true,
                    text: 'Medição (%)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Tempo (s)'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        }
    }
});

function sendFrameToAPI() {
    console.log("Capturando frame da câmera...");
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converte o frame para Base64
    const frameBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
    console.log("Frame capturado e convertido para Base64");

    // Enviar o frame para a API
    console.log("Enviando o frame para a API...");
    fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: frameBase64 })
    })
    .then(response => {
        console.log("Resposta da API recebida:", response);
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Resposta da API processada:", data);
        if (data.prediction_pt && data.prediction_en) {
            var classIA = document.getElementById('ClassiIA')
            predictionText.innerText = `Predição: ${data.prediction_pt} / ${data.prediction_en}`;
            classIA.innerHTML =data.prediction_pt 
        } else {
            console.warn("Previsão não encontrada na resposta da API");
            predictionText.innerText = "Erro na previsão. Tente novamente.";
        }
    })
    .catch(error => {
        console.error("Erro ao enviar o frame:", error);
        if (error.message.includes('fetch')) {
            predictionText.innerText = "Erro de comunicação com a API";
        } else {
            predictionText.innerText = "Erro desconhecido ao enviar o frame";
        }
    });
}
// requisição para o servidor e atualiza os gráficos
async function atualizarGraficos() {
    try {
        var response = await fetch('https://esp32-server-production.up.railway.app/getData', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do servidor');
        }

        var jsonData = await response.json();
        
        // Atualizar dados de Umidade do Solo
        umidadeArray = jsonData.umiTerra;
        var UmiSo = document.getElementById('UmiSo')
        var humidityElement = document.getElementById('humidity');
        humidityElement.textContent = umidadeArray[umidadeArray.length - 1].toFixed(2);
        UmiSo.innerHTML = umidadeArray[umidadeArray.length - 1].toFixed(2);
        linha1.data.datasets[0].data = umidadeArray;
        linha1.update();

        // Atualizar dados de Temperatura do Ar
        tempArArray = jsonData.tempAr;
        var temperatureElement = document.getElementById('temperature'); // temperatura - dados
        temperatureElement.textContent = tempArArray[tempArArray.length - 1].toFixed(2);
        
        var tempArElement = document.getElementById('tempAr'); // temperatura - gráfico
        tempArElement.textContent = tempArArray[tempArArray.length - 1].toFixed(2);
        linha2.data.datasets[0].data = tempArArray;
        linha2.update();

        // Atualizar dados de Umidade do Ar
        umidArArray = jsonData.umidAr;
        var umidArElement = document.getElementById('umidAr');
        umidArElement.textContent = umidArArray[umidArArray.length - 1].toFixed(2);
        linha3.data.datasets[0].data = umidArArray;
        linha3.update();

        // Atualizar umidade do ar nos dados
        var humidityAirElement = document.getElementById('humidityAir');
        humidityAirElement.textContent = umidArArray[umidArArray.length - 1].toFixed(2);

        // gráfico combinado com 3 linhas
        combinedChart.data.datasets[0].data = tempArArray; 
        combinedChart.data.datasets[1].data = umidadeArray; 
        combinedChart.data.datasets[2].data = umidArArray; 
        combinedChart.update();

    } catch (error) {
        console.error('Erro ao atualizar gráficos:', error);
    }
}
setInterval(sendFrameToAPI, 1000)
setInterval(atualizarGraficos, 1000);