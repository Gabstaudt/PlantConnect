
var canvas = document.getElementById('plantLive');
var ctx = canvas.getContext('2d');
var img = new Image();
img.src = '/representacao.jpg';
img.onload = () => {
    
    const x = 0;
    const y = 0;
    const width = canvas.width;
    const height = canvas.height;
  
    ctx.drawImage(img, x, y, width, height);
};

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
            tension: 0.3,
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
        
        // Umidade do Solo
        umidadeArray = jsonData.umiTerra;
        var humidityElement = document.getElementById('humidity');
        humidityElement.textContent = umidadeArray[umidadeArray.length - 1].toFixed(2);
        linha1.data.datasets[0].data = umidadeArray;
        linha1.update();

        //  Temperatura do Ar
        tempArArray = jsonData.tempAr;
        var temperatureElement = document.getElementById('temperature'); // temperatura - dados
        temperatureElement.textContent = tempArArray[tempArArray.length - 1].toFixed(2);
        
        var tempArElement = document.getElementById('tempAr'); //temperatura - gráfico
        tempArElement.textContent = tempArArray[tempArArray.length - 1].toFixed(2);
        linha2.data.datasets[0].data = tempArArray;
        linha2.update();

        // Umidade do Ar - gráfico
        umidArArray = jsonData.umidAr;
        var umidArElement = document.getElementById('umidAr');
        umidArElement.textContent = umidArArray[umidArArray.length - 1].toFixed(2);
        linha3.data.datasets[0].data = umidArArray;
        linha3.update();

        // Umidade do Ar - dados
        var humidityAirElement = document.getElementById('humidityAir');
        humidityAirElement.textContent = umidArArray[umidArArray.length - 1].toFixed(2);
        
    } catch (error) {
        console.error('Erro ao atualizar gráficos:', error);
    }
}

setInterval(atualizarGraficos, 1000);
