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
setInterval(sendFrameToAPI, 1000)