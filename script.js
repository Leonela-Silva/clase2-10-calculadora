// Variables para guardar cotizaciones
let rates = {
    blue: 0,
    oficial: 0
};

// Elementos HTML
const oficialPriceEl = document.getElementById('oficialPrice');
const bluePriceEl = document.getElementById('bluePrice');
const amountInput = document.getElementById('amountInput');
const typeSelect = document.getElementById('typeSelect');
const resultAmount = document.getElementById('resultAmount');
const refreshBtn = document.getElementById('refreshBtn');

// Consultar API en vivo al cargar
document.addEventListener('DOMContentLoaded', () => {
    fetchRates();

    // Eventos interactivos en tiempo real
    amountInput.addEventListener('input', calculateTotal);
    typeSelect.addEventListener('change', calculateTotal);
    refreshBtn.addEventListener('click', fetchRates);
});

// Obtener datos reales mediante API gratuita
async function fetchRates() {
    refreshBtn.innerText = "Cargando...";
    
    try {
        const responseBlue = await fetch('https://dolarapi.com/v1/dolares/blue');
        const dataBlue = await responseBlue.json();
        
        const responseOficial = await fetch('https://dolarapi.com/v1/dolares/oficial');
        const dataOficial = await responseOficial.json();

        rates.blue = dataBlue.venta;
        rates.oficial = dataOficial.venta;

        // Mostrar cotizaciones con formato moneda
        bluePriceEl.innerText = `$${rates.blue}`;
        oficialPriceEl.innerText = `$${rates.oficial}`;

        calculateTotal();
    } catch (error) {
        alert("Error al cargar los datos del dólar.");
    } finally {
        refreshBtn.innerText = "🔄 Actualizar valores";
    }
}

// Lógica del cálculo automático
function calculateTotal() {
    const amount = parseFloat(amountInput.value) || 0;
    const selectedType = typeSelect.value;
    const currentRate = rates[selectedType] || 0;

    const total = amount * currentRate;

    // Formatear resultado a moneda de Argentina
    resultAmount.innerText = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(total);
}