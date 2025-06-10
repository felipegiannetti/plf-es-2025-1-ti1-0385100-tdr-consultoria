document.addEventListener("DOMContentLoaded", async () => {
    const gridContainer = document.getElementById("avaliacoes-grid");

    try {
        // Fetch data from the JSON server
        const response = await fetch("http://localhost:3000/avaliacoeseventos");
        const avaliacoes = await response.json();

        // Generate cards for each avaliação
        avaliacoes.forEach(avaliacao => {
            const card = document.createElement("div");
            card.className = "col-md-4";

            card.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-body">
                        <div class="stars mb-2">
                            ${"★".repeat(avaliacao.rating || 5)} 
                            <span class="text-muted">(${avaliacao.rating || 5}.0)</span>
                        </div>
                        <h5 class="card-title">${avaliacao.nome || "Anônimo"}</h5>
                        <p class="card-text">${avaliacao.comentario}</p>
                        <small class="text-muted">Evento ID: ${avaliacao.idevento}</small>
                    </div>
                </div>
            `;

            gridContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar as avaliações:", error);
        gridContainer.innerHTML = `<p class="text-danger">Erro ao carregar as avaliações.</p>`;
    }
});