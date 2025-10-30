/* -------------------- DEBUG BANNER -------------------- */
console.log("%c[app.js] carregado", "background:#222;color:#0f0;padding:2px 6px;border-radius:4px");

/* -------------------- POPUP -------------------- */
function openPopup() {
  document.getElementById("projectPopup").style.display = "flex";
}
function closePopup() {
  document.getElementById("projectPopup").style.display = "none";
}

/* -------------------- VIDEO & PREDICTION -------------------- */
const video = document.getElementById("video");
const predictionText = document.getElementById("prediction");

let loopStarted = false;

/* util: log agrupado seguro */
function group(label, fn, collapsed = true) {
  try {
    (collapsed ? console.groupCollapsed : console.group)(label);
    fn();
  } catch (e) {
    console.error(label, e);
  } finally {
    console.groupEnd?.();
  }
}

/* helper: mede tempo de uma promise */
async function timed(label, promiseFactory) {
  const t0 = performance.now();
  try {
    const res = await promiseFactory();
    const dt = (performance.now() - t0).toFixed(1);
    console.log(`${label} OK em ${dt}ms`);
    return res;
  } catch (e) {
    const dt = (performance.now() - t0).toFixed(1);
    console.warn(`${label} FALHOU em ${dt}ms`, e);
    throw e;
  }
}

/* helper: fetch com timeout (AbortController) */
async function fetchWithTimeout(url, opts = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/* Inicia a câmera e tenta iniciar o loop com 3 gatilhos (robusto) */
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    group("[cam] inicialização", () => {
      console.log("[cam] acesso OK");
      video.srcObject = stream;
    });

    const startLoop = (who) => {
      if (loopStarted) {
        return;
      }
      if (!video.videoWidth || !video.videoHeight) {
        return;
      }
      loopStarted = true;
      
      iniciarAtualizacao();
    };

    video.addEventListener("loadedmetadata", () => {
      video.play().then(() => startLoop("loadedmetadata"));
    });

    video.addEventListener("loadeddata", () => {
      startLoop("loadeddata");
    });

    video.addEventListener("canplay", () => {
      startLoop("canplay");
    });

    // Fallback de segurança (2s)
    setTimeout(() => startLoop("fallback-2s"), 2000);
  })
  .catch((error) => {
    console.error("[cam] erro:", error);
    if (error.name === "NotFoundError") {
      predictionText.innerText = "Erro: Nenhuma câmera encontrada.";
    } else if (error.name === "NotAllowedError") {
      predictionText.innerText = "Erro: Permissão de câmera negada.";
    } else if (error.name === "NotReadableError") {
      predictionText.innerText = "Erro: Câmera em uso ou não disponível.";
    } else {
      predictionText.innerText = "Erro desconhecido ao acessar a câmera.";
    }
  });



/* -------------------- ARRAYS DOS GRÁFICOS -------------------- */
var umidadeArray = [];
var tempArArray = [];
var umidArArray = [];

/* -------------------- CHARTS -------------------- */
var linha1 = new Chart(document.getElementById("pressureLineChart"), {
  type: "line",
  data: {
    labels: ["10s", "9s", "8s", "7s", "6s", "5s", "4s", "3s", "2s", "1s"],
    datasets: [
      {
        label: "Umidade do Solo",
        data: umidadeArray,
        borderColor: "green",
        borderWidth: 3,
        tension: 0,
        fill: false,
        pointRadius: 1,
      },
    ],
  },
  options: {
    scales: { y: { beginAtZero: true, min: 0, max: 100 } },
    animation: { duration: 0 },
  },
});

var linha2 = new Chart(document.getElementById("tempArAreaChart"), {
  type: "line",
  data: {
    labels: ["10s", "9s", "8s", "7s", "6s", "5s", "4s", "3s", "2s", "1s"],
    datasets: [
      {
        label: "Temperatura do Ar",
        data: tempArArray,
        borderColor: "orange",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 3,
        fill: true,
        pointRadius: 1,
      },
    ],
  },
  options: {
    scales: { y: { beginAtZero: true, min: -10, max: 50 } },
    animation: { duration: 0 },
  },
});

var linha3 = new Chart(document.getElementById("umidArLineChart"), {
  type: "line",
  data: {
    labels: ["10s", "9s", "8s", "7s", "6s", "5s", "4s", "3s", "2s", "1s"],
    datasets: [
      {
        label: "Umidade do Ar",
        data: umidArArray,
        borderColor: "#89CFF0",
        borderWidth: 3,
        tension: 0,
        fill: false,
        pointRadius: 1,
      },
    ],
  },
  options: {
    scales: { y: { beginAtZero: true, min: 0, max: 100 } },
    animation: { duration: 0 },
  },
});

var combinedChart = new Chart(document.getElementById("combinedChart"), {
  type: "line",
  data: {
    labels: ["10s", "9s", "8s", "7s", "6s", "5s", "4s", "3s", "2s", "1s"],
    datasets: [
      {
        label: "Temperatura do Ar (°C)",
        data: tempArArray,
        borderColor: "orange",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
      },
      {
        label: "Umidade do Solo (%)",
        data: umidadeArray,
        borderColor: "green",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
      },
      {
        label: "Umidade do Ar (%)",
        data: umidArArray,
        borderColor: "#89CFF0",
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
      },
    ],
  },
  options: {
    animation: { duration: 0 },
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: { stepSize: 10, callback: (v) => v },
        title: { display: true, text: "Medição (%)" },
      },
      x: { title: { display: true, text: "Tempo (s)" } },
    },
    plugins: { legend: { display: true, position: "top" } },
  },
});

/* -------------------- FUNÇÕES AUXILIARES -------------------- */
function updateGraphArray(array, value) {
  if (typeof value !== "number" || isNaN(value)) return array;
  if (array.length < 10) array.push(value);
  else {
    array.shift();
    array.push(value);
  }
  return array;
}

/* -------------------- ATUALIZA SENSORES (ESP32-SERVER) -------------------- */
async function atualizarGraficos() {
  try {
    const url = "http://localhost:5500/sensor";
    const res = await fetchWithTimeout(url, {}, 2500);
    console.log("[sensores] status", res.status);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // Os dados vêm em formato de array [umidade_solo, temperatura_ar, umidade_ar]
    const [umiTerra, tempAr, umidAr] = data;

    // Converte o valor da umidade do solo (0-4095) para porcentagem (0-100)
    // 4095 = 0% (solo seco) e 0 = 100% (solo úmido)
    const umiTerraPorcentagem = Math.round(100 - (Number(umiTerra) / 4095 * 100));

    // Atualiza arrays com novos dados
    umidadeArray = updateGraphArray(umidadeArray, umiTerraPorcentagem);
    tempArArray = updateGraphArray(tempArArray, Number(tempAr));
    umidArArray = updateGraphArray(umidArArray, Number(umidAr));

    // Atualiza elementos de texto
    if (umidadeArray.length) {
      const val = umidadeArray[umidadeArray.length - 1];
      const umiSoEl = document.getElementById("UmiSo");
      const humidityEl = document.getElementById("humidity");
      if (umiSoEl) umiSoEl.textContent = val.toFixed(2);
      if (humidityEl) humidityEl.textContent = val.toFixed(2);
    }

    if (tempArArray.length) {
      const val = tempArArray[tempArArray.length - 1];
      const temperatureEl = document.getElementById("temperature");
      const tempArEl = document.getElementById("tempAr");
      if (temperatureEl) temperatureEl.textContent = val.toFixed(2);
      if (tempArEl) tempArEl.textContent = val.toFixed(2);
    }

    if (umidArArray.length) {
      const val = umidArArray[umidArArray.length - 1];
      const umidArEl = document.getElementById("umidAr");
      const humidityAirEl = document.getElementById("humidityAir");
      if (umidArEl) umidArEl.textContent = val.toFixed(2);
      if (humidityAirEl) humidityAirEl.textContent = val.toFixed(2);
    }

    // Atualiza dados dos gráficos
    linha1.data.datasets[0].data = [...umidadeArray];
    linha2.data.datasets[0].data = [...tempArArray];
    linha3.data.datasets[0].data = [...umidArArray];
    combinedChart.data.datasets[0].data = [...tempArArray];
    combinedChart.data.datasets[1].data = [...umidadeArray];
    combinedChart.data.datasets[2].data = [...umidArArray];

    // Força atualização de todos os gráficos
    linha1.update('none');
    linha2.update('none');
    linha3.update('none');
    combinedChart.update('none');

  } catch (error) {
    console.warn("[sensores] falhou/timeout (segue sem travar):", error?.message || error);
  }
}

/* -------------------- ENVIA FRAME PARA A IA (FLASK) -------------------- */
async function sendFrameToAPI() {
  // garante que a câmera esteja pronta
  if (
    !video ||
    video.readyState < 2 ||
    video.videoWidth === 0 ||
    video.videoHeight === 0
  ) {
    console.log("[ia] vídeo ainda não pronto (skip)");
    return;
  }

  const targetW = 320;
  const ratio = targetW / video.videoWidth;
  const targetH = Math.max(1, Math.round(video.videoHeight * ratio));

  const t0 = performance.now();

  // desenha frame downscaled
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // base64 (apenas o payload, sem prefixo)
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  const base64 = dataUrl.split(",")[1];
  const kb = Math.round((base64.length * 3) / 4 / 1024);

  group("[ia] frame pronto", () => {
    console.log("dimensões origem:", `${video.videoWidth}x${video.videoHeight}`);
    console.log("dimensões envio:", `${targetW}x${targetH}`);
    console.log("payload ~", `${kb} KB`);
  });

  // timeout de segurança
  const controller = new AbortController();
  const timeoutMs = 8000;
  const to = setTimeout(() => controller.abort(), timeoutMs);

  const url = "http://127.0.0.1:5000/predict";

  try {
    const res = await timed(`[ia] POST ${url}`, async () =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
        signal: controller.signal,
      })
    );
    clearTimeout(to);

    group("[ia] resposta HTTP", () => {
      console.log("status:", res.status, res.statusText);
      console.log("ok:", res.ok);
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`API HTTP ${res.status} – ${txt.slice(0, 200)}`);
    }

    const data = await timed("[ia] parse JSON", async () => res.json());

    group("[ia] JSON recebido", () => {
      console.log(data);
    });

    const label =
      data.prediction_pt ||
      data.prediction_en ||
      data.label ||
      data.class ||
      data.prediction;

    const classIA = document.getElementById("ClassiIA");
    if (label) {
      predictionText.textContent = data.prediction_pt
        ? `Predição: ${data.prediction_pt} / ${data.prediction_en ?? ""}`.trim()
        : `Predição: ${label}`;
      if (classIA) classIA.textContent = data.prediction_pt || label;
    } else {
      predictionText.textContent = `Sem classificação (resposta: ${JSON.stringify(data).slice(0, 200)}...)`;
    }

    const dt = (performance.now() - t0).toFixed(1);
    console.log(`[ia] ciclo concluído em ${dt}ms (inclui captura+POST+parse)`);
  } catch (err) {
    clearTimeout(to);
    const kind = err?.name === "AbortError" ? "timeout" : "erro";
    console.error(`[ia] ${kind}:`, err?.message || err);
    predictionText.textContent = `Erro IA: ${err?.message || "desconhecido"}`;
  }
}

/* -------------------- LOOP PRINCIPAL -------------------- */
async function iniciarAtualizacao() {
  console.log("[loop] iniciado");
  let tick = 0;
  while (true) {
    tick++;
    if (tick % 10 === 0) console.log("[loop] tick", tick);

    // Roda sensores e IA em paralelo; nenhuma bloqueia a outra
    await Promise.allSettled([atualizarGraficos(), sendFrameToAPI()]);

    await new Promise((r) => setTimeout(r, 1000)); // 1s
  }
}
