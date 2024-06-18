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
}

// Abrir a aba "Input" por padrão
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.tab button:first-child').click();
});

// Referência ao formulário
const ratingForm = document.getElementById('ratingForm');

// Função para salvar os dados no Firebase
ratingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const serve = parseInt(document.getElementById('serve').value);
    const attack = parseInt(document.getElementById('attack').value);
    const block = parseInt(document.getElementById('block').value);
    const set = parseInt(document.getElementById('set').value);
    const reception = parseInt(document.getElementById('reception').value);

    // Referência ao Firebase
    const ratingsRef = firebase.database().ref('ratings');
    
    // Adiciona os dados
    ratingsRef.push({
        username: username,
        serve: serve,
        attack: attack,
        block: block,
        set: set,
        reception: reception
    }).then(() => {
        alert('Dados salvos com sucesso!');
        ratingForm.reset();
    }).catch((error) => {
        console.error('Erro ao salvar dados no Firebase:', error);
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
            <td>${user}</td>
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

// Chamada inicial para carregar e exibir médias
loadAverages();
