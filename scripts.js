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

    // Verifica se a aba 'Visualization' foi aberta
    if (tabName === 'Visualization') {
        loadAverages();
    }

    // Verifica se a aba 'Ranking' foi aberta
    if (tabName === 'Ranking') {
        loadRanking();
    }
}

// Abrir a aba "Input" por padrão
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.tab button:first-child').click();
    loadUsernames();  // Carregar nomes de usuários ao carregar a página
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
    loadUsernames();  // Atualizar a lista de usuários após salvar
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

// Função para carregar nomes de usuários cadastrados
function loadUsernames() {
    const usernamesRef = firebase.database().ref('ratings');
    usernamesRef.once('value', (snapshot) => {
        const usernames = [];
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (!usernames.includes(data.username)) {
                usernames.push(data.username);
            }
        });

        const datalist = document.getElementById('usernames');
        datalist.innerHTML = '';  // Limpar opções existentes

        usernames.forEach(username => {
            const option = document.createElement('option');
            option.value = username;
            datalist.appendChild(option);
        });
    });
}

// Função para carregar médias
function loadAverages() {
    const ratingsRef = firebase.database().ref('ratings');
    ratingsRef.once('value', (snapshot) => {
        const userRatings = {};

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (!userRatings[data.username]) {
                userRatings[data.username] = {
                    serve: [],
                    attack: [],
                    block: [],
                    set: [],
                    reception: []
                };
            }

            userRatings[data.username].serve.push(data.serve);
            userRatings[data.username].attack.push(data.attack);
            userRatings[data.username].block.push(data.block);
            userRatings[data.username].set.push(data.set);
            userRatings[data.username].reception.push(data.reception);
        });

        const averageTableBody = document.getElementById('averageTableBody');
        averageTableBody.innerHTML = '';

        for (const username in userRatings) {
            const ratings = userRatings[username];
            const avgServe = (ratings.serve.reduce((a, b) => a + b, 0) / ratings.serve.length).toFixed(2);
            const avgAttack = (ratings.attack.reduce((a, b) => a + b, 0) / ratings.attack.length).toFixed(2);
            const avgBlock = (ratings.block.reduce((a, b) => a + b, 0) / ratings.block.length).toFixed(2);
            const avgSet = (ratings.set.reduce((a, b) => a + b, 0) / ratings.set.length).toFixed(2);
            const avgReception = (ratings.reception.reduce((a, b) => a + b, 0) / ratings.reception.length).toFixed(2);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${username}</td>
                <td>${avgServe}</td>
                <td>${avgAttack}</td>
                <td>${avgBlock}</td>
                <td>${avgSet}</td>
                <td>${avgReception}</td>
                <td><button onclick="deleteUserRatings('${username}')">Excluir</button></td>
            `;
            averageTableBody.appendChild(row);
        }
    });
}

// Função para carregar ranking
function loadRanking() {
    const ratingsRef = firebase.database().ref('ratings');
    ratingsRef.once('value', (snapshot) => {
        const userRatings = {};

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (!userRatings[data.username]) {
                userRatings[data.username] = [];
            }

            const avgRating = (data.serve + data.attack + data.block + data.set + data.reception) / 5;
            userRatings[data.username].push(avgRating);
        });

        const userAverages = [];
        for (const username in userRatings) {
            const avgRating = (userRatings[username].reduce((a, b) => a + b, 0) / userRatings[username].length).toFixed(2);
            userAverages.push({ username, avgRating });
        }

        userAverages.sort((a, b) => b.avgRating - a.avgRating);

        const rankingTableBody = document.getElementById('rankingTableBody');
        rankingTableBody.innerHTML = '';

        userAverages.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.avgRating}</td>
            `;
            rankingTableBody.appendChild(row);
        });
    });
}

// Função para deletar pontuações de um usuário
function deleteUserRatings(username) {
    const ratingsRef = firebase.database().ref('ratings');
    ratingsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().username === username) {
                childSnapshot.ref.remove();
            }
        });

        loadAverages();
        loadRanking();
        loadUsernames();  // Atualizar a lista de usuários após excluir
    });
}
