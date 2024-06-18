// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC1LY3XXHiYJS7WEiDJLx68VqI3YewMHwU",
    authDomain: "voleirelaxado.firebaseapp.com",
    projectId: "voleirelaxado",
    storageBucket: "voleirelaxado.appspot.com",
    messagingSenderId: "423686376310",
    appId: "1:423686376310:web:f6e1f0596719e768458857",
    measurementId: "G-Q4KY66DYFC"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Função para mudar de aba
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    // Verifica se a aba 'Visualization' ou 'Ranking' foi aberta
    if (tabName === 'Visualization') {
        loadAverages();
    } else if (tabName === 'Ranking') {
        loadRanking();
    }
}

// Abrir a aba "Input" por padrão
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.tab button:first-child').click();
});

// Referência ao formulário
const ratingForm = document.getElementById('ratingForm');

// Função para salvar os dados no Firebase
ratingForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const serve = getStarRating('serveRating');
    const attack = getStarRating('attackRating');
    const block = getStarRating('blockRating');
    const set = getStarRating('setRating');
    const reception = getStarRating('receptionRating');

    const ratingsRef = firebase.database().ref('ratings');
    const newRating = ratingsRef.push();

    newRating.set({
        username,
        serve,
        attack,
        block,
        set,
        reception
    });

    ratingForm.reset();
    resetStarRatings();
    alert('Pontuação salva com sucesso!');
});

// Função para obter a classificação por estrelas
function getStarRating(ratingId) {
    const stars = document.querySelectorAll(`#${ratingId} span.selected`);
    return stars.length;
}

// Função para redefinir as estrelas selecionadas
function resetStarRatings() {
    const starContainers = document.querySelectorAll('.star-rating');
    starContainers.forEach(container => {
        container.querySelectorAll('span').forEach(star => {
            star.classList.remove('selected');
        });
    });
}

// Adiciona evento de clique para selecionar estrelas
document.querySelectorAll('.star-rating').forEach(starContainer => {
    starContainer.addEventListener('click', function (event) {
        if (!event.target.matches('span')) return;

        const clickedStar = event.target;
        const rating = parseInt(clickedStar.getAttribute('data-value'));
        const siblings = Array.from(clickedStar.parentElement.children);

        // Marca as estrelas até o valor clicado
        siblings.forEach(sibling => {
            const value = parseInt(sibling.getAttribute('data-value'));
            sibling.classList.toggle('selected', value <= rating);
        });
    });
});

// Função para carregar e exibir médias
function loadAverages() {
    const ratingsRef = firebase.database().ref('ratings');

    ratingsRef.once('value', (snapshot) => {
        const ratings = snapshot.val();

        if (!ratings) {
            console.log('Sem dados disponíveis.');
            return;
        }

        const usersAverages = {};

        // Organizar por usuário e calcular médias
        Object.keys(ratings).forEach((key) => {
            const rating = ratings[key];
            const user = rating.username;

            if (!usersAverages[user]) {
                usersAverages[user] = {
                    ids: [], // Lista de IDs para exclusão
                    serve: [],
                    attack: [],
                    block: [],
                    set: [],
                    reception: []
                };
            }

            usersAverages[user].ids.push(key);
            usersAverages[user].serve.push(rating.serve);
            usersAverages[user].attack.push(rating.attack);
            usersAverages[user].block.push(rating.block);
            usersAverages[user].set.push(rating.set);
            usersAverages[user].reception.push(rating.reception);
        });

        // Calcular médias e exibir na tabela
        displayAverages(usersAverages);
    }).catch((error) => {
        console.error('Erro ao carregar dados do Firebase:', error);
    });
}

// Função para calcular médias e exibir na tabela
function displayAverages(usersAverages) {
    const averageTableBody = document.getElementById('averageTableBody');
    averageTableBody.innerHTML = '';

    Object.keys(usersAverages).forEach(user => {
        const averages = calculateAverages(usersAverages[user]);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${user}</strong></td>
            <td>${averages.serve}</td>
            <td>${averages.attack}</td>
            <td>${averages.block}</td>
            <td>${averages.set}</td>
            <td>${averages.reception}</td>
            <td><button class="delete-btn" onclick="deleteUser('${usersAverages[user].ids}')">🗑️</button></td>
        `;
        averageTableBody.appendChild(row);
    });
}

// Função para excluir usuário
function deleteUser(userIds) {
    const ratingsRef = firebase.database().ref('ratings');
    const ids = userIds.split(',');

    ids.forEach(id => {
        ratingsRef.child(id).remove().then(() => {
            console.log(`Usuário com ID ${id} removido com sucesso.`);
            loadAverages(); // Recarregar a tabela após exclusão
        }).catch((error) => {
            console.error('Erro ao excluir usuário:', error);
        });
    });
}

// Função para calcular médias individuais
function calculateAverages(userRatings) {
    return {
        serve: calculateAverage(userRatings.serve),
        attack: calculateAverage(userRatings.attack),
        block: calculateAverage(userRatings.block),
        set: calculateAverage(userRatings.set),
        reception: calculateAverage(userRatings.reception)
    };
}

// Função auxiliar para calcular a média
function calculateAverage(scoreArray) {
    if (!scoreArray || scoreArray.length === 0) {
        return 0;
    }
    const sum = scoreArray.reduce((acc, curr) => acc + curr, 0);
    return (sum / scoreArray.length).toFixed(2);
}

// Função para calcular a média geral
function calculateOverallAverage(userAverages) {
    const totalAverage = (parseFloat(userAverages.serve) + parseFloat(userAverages.attack) + parseFloat(userAverages.block) + parseFloat(userAverages.set) + parseFloat(userAverages.reception)) / 5;
    return totalAverage.toFixed(2);
}

// Função para carregar e exibir o ranking
function loadRanking() {
    const ratingsRef = firebase.database().ref('ratings');

    ratingsRef.once('value', (snapshot) => {
        const ratings = snapshot.val();

        if (!ratings) {
            console.log('Sem dados disponíveis.');
            return;
        }

        const usersAverages = {};

        // Organizar por usuário e calcular médias
        Object.keys(ratings).forEach((key) => {
            const rating = ratings[key];
            const user = rating.username;

            if (!usersAverages[user]) {
                usersAverages[user] = {
                    serve: [],
                    attack: [],
                    block: [],
                    set: [],
                    reception: []
                };
            }

            usersAverages[user].serve.push(rating.serve);
            usersAverages[user].attack.push(rating.attack);
            usersAverages[user].block.push(rating.block);
            usersAverages[user].set.push(rating.set);
            usersAverages[user].reception.push(rating.reception);
        });

        // Calcular médias e organizar o ranking
        const ranking = Object.keys(usersAverages).map(user => {
            const averages = calculateAverages(usersAverages[user]);
            const overallAverage = calculateOverallAverage(averages);
            return {
                user,
                overallAverage
            };
        }).sort((a, b) => b.overallAverage - a.overallAverage);

        // Exibir o ranking na tabela
        displayRanking(ranking);
    }).catch((error) => {
        console.error('Erro ao carregar dados do Firebase:', error);
    });
}

// Função para exibir o ranking na tabela
function displayRanking(ranking) {
    const rankingTableBody = document.getElementById('rankingTableBody');
    rankingTableBody.innerHTML = '';

    ranking.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${entry.user}</strong></td>
            <td>${entry.overallAverage}</td>
        `;
        rankingTableBody.appendChild(row);
    });
}

// Chamada inicial para carregar e exibir médias
loadAverages();
