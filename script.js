const rates = {
    blue: 0,
    mep: 0,
    ccl: 0,
    tarjeta: 0,
    oficial: 0,
    cripto: 0
};

let modeUsdToArs = true;

const amountInput = document.getElementById('amountInput');
const typeSelect = document.getElementById('typeSelect');
const resultValue = document.getElementById('resultValue');
const brechaInfo = document.getElementById('brechaInfo');
const inputLabel = document.getElementById('inputLabel');
const refreshBtn = document.getElementById('refreshBtn');

const btnUsdToArs = document.getElementById('modeUsdToArs');
const btnArsToUsd = document.getElementById('modeArsToUsd');

document.addEventListener('DOMContentLoaded', () => {
    fetchRates();

    amountInput.addEventListener('input', calculate);
    typeSelect.addEventListener('change', calculate);
    refreshBtn.addEventListener('click', fetchRates);

    btnUsdToArs.addEventListener('click', () => setMode(true));
    btnArsToUsd.addEventListener('click', () => setMode(false));
});

function setMode(usdToArs) {
    modeUsdToArs = usdToArs;
    if (modeUsdToArs) {
        btnUsdToArs.classList.add('active');
        btnArsToUsd.classList.remove('active');
        inputLabel.innerText = "Monto en USD:";
    } else {
        btnArsToUsd.classList.add('active');
        btnUsdToArs.classList.remove('active');
        inputLabel.innerText = "Monto en ARS:";
    }
    calculate();
}

async function fetchRates() {
    refreshBtn.innerText = "Cargando mercado...";
    try {
        const response = await fetch('https://dolarapi.com/v1/dolares');
        const data = await response.json();

        // Mapear respuesta a nuestro objeto de cotizaciones
        data.forEach(item => {
            const key = item.casa.toLowerCase();
            if (rates.hasOwnProperty(key)) {
                rates[key] = item.venta;
                const el = document.getElementById(`val-${key}`);
                if (el) el.innerText = `$${item.venta}`;
            }
        });

        calculate();
    } catch (err) {
        alert("Error al obtener cotizaciones en tiempo real.");
    } finally {
        refreshBtn.innerText = "🔄 Actualizar Mercado";
    }
}

function calculate() {
    const amount = parseFloat(amountInput.value) || 0;
    const selectedType = typeSelect.value;
    const currentRate = rates[selectedType] || 0;

    if (currentRate === 0) return;

    if (modeUsdToArs) {
        const total = amount * currentRate;
        resultValue.innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
    } else {
        const total = amount / currentRate;
        resultValue.innerText = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total);
    }

    // Cálculo de brecha respecto al oficial
    if (rates.oficial > 0 && selectedType !== 'oficial') {
        const brecha = ((currentRate - rates.oficial) / rates.oficial) * 100;
        brechaInfo.innerText = `Brecha con el Oficial: +${brecha.toFixed(1)}%`;
    } else {
        brechaInfo.innerText = "Cotización de Referencia Base";
    }
}
  
