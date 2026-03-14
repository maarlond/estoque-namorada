function iniciarDashboard() {

    const ctx = document.getElementById('graficoVendas');

    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
            datasets: [{
                label: 'Vendas',
                data: [120, 90, 150, 200, 300, 100, 250],
                backgroundColor: '#ec4899'
            }]
        }
    });

}