// Valores de respaldo si la API no responde
let quotesData = {
    blue: { compra: 1220, venta: 1240, nombre: "Dólar Blue" },
    oficial: { compra: 1000, venta: 1040, nombre: "Dólar Oficial" },
    mep: { compra: 1190, venta: 1195, nombre: "Dólar MEP" },
    ccl: { compra: 1210, venta: 1218, nombre: "Dólar CCL" },
    tarjeta: { compra: 0, venta: 1664, nombre: "Dólar Tarjeta" },
    cripto: { compra: 1230, venta: 1245, nombre: "Dólar Cripto" }
};

let usdToArsMode = true;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    fetchQuotes();

    // Listener para Conversor
    document.getElementById('convertAmount').addEventListener('input', calculateConversion);
    document.getElementById('convertType').addEventListener('change', calculateConversion);
    document.getElementById('btnUsdToArs').addEventListener('click', () => setConversionMode(true));
    document.getElementById('btnArsToUsd').addEventListener('click', () => setConversionMode(false));

    // Listener para Plazo Fijo
    document.getElementById('pfMonto').addEventListener('input', calculatePlazoFijo);
    document.getElementById('pfTna').addEventListener('input', calculatePlazoFijo);
    document.getElementById('pfDias').addEventListener('input', calculatePlazoFijo);

    document.getElementById('refreshBtn').addEventListener('click', fetchQuotes);
});

// Control de Pestañas
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

// Obtención de Datos de la API
async function fetchQuotes() {
    const quotesGrid = document.getElementById('quotesGrid');
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.innerText = "⏳ Cargando...";

    try {
        const response = await fetch('https://dolarapi.com/v1/dolares');
        if (response.ok) {
            const data = await response.json();
            data.forEach(item => {
                const key = item.casa.toLowerCase();
                if (quotesData[key]) {
                    quotesData[key].compra = item.compra || item.venta;
                    quotesData[key].venta = item.venta;
                }
            });
        }
    } catch (e) {
        console.warn("API no disponible, usando valores de respaldo local.");
    } finally {
        renderQuotes();
        calculateConversion();
        calculatePlazoFijo();
        refreshBtn.innerText = "🔄 Actualizar";
    }
}

// Renderizar Tarjetas de Cotizaciones
function renderQuotes() {
    const quotesGrid = document.getElementById('quotesGrid');
    quotesGrid.innerHTML = '';

    Object.keys(quotesData).forEach(key => {
        const item = quotesData[key];
        const card = document.createElement('div');
        card.className = 'q-card';
        card.innerHTML = `
            <div class="q-header">
                <span class="q-title">${item.nombre}</span>
                <span class="q-tag">ARS</span>
            </div>
            <div class="q-prices">
                <div class="q-price-box">
                    <span>Compra</span>
                    <strong>$${item.compra || '--'}</strong>
                </div>
                <div class="q-price-box" style="text-align: right;">
                    <span>Venta</span>
                    <strong>$${item.venta}</strong>
                </div>
            </div>
        `;
        quotesGrid.appendChild(card);
    });
}

// Lógica de Conversión
function setConversionMode(isUsdToArs) {
    usdToArsMode = isUsdToArs;
    document.getElementById('btnUsdToArs').classList.toggle('active', isUsdToArs);
    document.getElementById('btnArsToUsd').classList.toggle('active', !isUsdToArs);
    
    document.getElementById('inputLabel').innerText = isUsdToArs 
        ? "Monto a Convertir (USD):" 
        : "Monto a Convertir ($ ARS):";

    calculateConversion();
}

function calculateConversion() {
    const amount = parseFloat(document.getElementById('convertAmount').value) || 0;
    const type = document.getElementById('convertType').value;
    const rate = quotesData[type] ? quotesData[type].venta : 0;
    const oficialRate = quotesData.oficial ? quotesData.oficial.venta : 1;

    const resultOutput = document.getElementById('resultOutput');
    const brechaBadge = document.getElementById('brechaBadge');

    if (rate === 0) return;

    if (usdToArsMode) {
        const total = amount * rate;
        resultOutput.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
    } else {
        const total = amount / rate;
        resultOutput.innerText = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total);
    }

    // Calcular Brecha con respecto al dólar Oficial
    if (type !== 'oficial' && oficialRate > 0) {
        const brecha = ((rate - oficialRate) / oficialRate) * 100;
        brechaBadge.innerText = `Brecha vs Oficial: +${brecha.toFixed(1)}%`;
    } else {
        brechaBadge.innerText = "Dólar de Referencia Oficial";
    }
}

// Lógica de Plazo Fijo
function calculatePlazoFijo() {
    const monto = parseFloat(document.getElementById('pfMonto').value) || 0;
    const tna = parseFloat(document.getElementById('pfTna').value) || 0;
    const dias = parseInt(document.getElementById('pfDias').value) || 0;

    const ganancia = monto * (tna / 100) * (dias / 365);
    const total = monto + ganancia;

    document.getElementById('pfGanancia').innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(ganancia);
    document.getElementById('pfTotal').innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
}
