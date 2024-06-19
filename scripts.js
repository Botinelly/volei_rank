// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1LY3XXHiYJS7WEiDJLx68VqI3YewMHwU",
    authDomain: "voleirelaxado.firebaseapp.com",
    projectId: "voleirelaxado",
    storageBucket: "voleirelaxado.appspot.com",
    messagingSenderId: "423686376310",
    appId: "1:423686376310:web:f6e1f0596719e768458857",
    measurementId: "G-Q4KY66DYFC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Function to handle star rating
function handleStarRating(starRatingElement) {
    const stars = starRatingElement.querySelectorAll('span');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');

            stars.forEach(innerStar => {
                innerStar.classList.toggle('selected', innerStar.getAttribute('data-value') <= value);
            });

            starRatingElement.setAttribute('data-rating', value);
        });
    });
}

// Handle star ratings
document.querySelectorAll('.star-rating').forEach(handleStarRating);

// Form submission handler
document.getElementById('ratingForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const serveRating = document.getElementById('serveRating').getAttribute('data-rating');
    const attackRating = document.getElementById('attackRating').getAttribute('data-rating');
    const blockRating = document.getElementById('blockRating').getAttribute('data-rating');
    const setRating = document.getElementById('setRating').getAttribute('data-rating');
    const receptionRating = document.getElementById('receptionRating').getAttribute('data-rating');

    const ratingsRef = firebase.database().ref('ratings');
    const newRatingRef = ratingsRef.push();
    newRatingRef.set({
        username: username,
        serve: parseInt(serveRating),
        attack: parseInt(attackRating),
        block: parseInt(blockRating),
        set: parseInt(setRating),
        reception: parseInt(receptionRating)
    });

    document.getElementById('ratingForm').reset();
    document.querySelectorAll('.star-rating span').forEach(star => {
        star.classList.remove('selected');
    });

    loadUsernames();
    loadAverages();
});

// Load usernames for datalist
function loadUsernames() {
    const ratingsRef = firebase.database().ref('ratings');

    ratingsRef.once('value', (snapshot) => {
        const ratings = snapshot.val();

        if (!ratings) {
            console.log('Sem dados disponíveis.');
            return;
        }

        const usernames = new Set();

        Object.keys(ratings).forEach((key) => {
            const rating = ratings[key];
            usernames.add(rating.username);
        });

        const usernamesDatalist = document.getElementById('usernames');
        usernamesDatalist.innerHTML = '';

        usernames.forEach(username => {
            const option = document.createElement('option');
            option.value = username;
            usernamesDatalist.appendChild(option);
        });
    }).catch((error) => {
        console.error('Erro ao carregar dados do Firebase:', error);
    });
}

// Load averages for visualization
function loadAverages() {
    const ratingsRef = firebase.database().ref('ratings');

    ratingsRef.once('value', (snapshot) => {
        const ratings = snapshot.val();

        if (!ratings) {
            console.log('Sem dados disponíveis.');
            return;
        }

        const usersAverages = {};

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

        const averageTableBody = document.getElementById('averageTableBody');
        averageTableBody.innerHTML = '';

        Object.keys(usersAverages).forEach(user => {
            const userRatings = usersAverages[user];
            const averages = calculateAverages(userRatings);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user}</td>
                <td>${averages.serve}</td>
                <td>${averages.attack}</td>
                <td>${averages.block}</td>
                <td>${averages.set}</td>
                <td>${averages.reception}</td>
                <td><button onclick="deleteUser('${user}')">🗑️</button></td>
            `;
            averageTableBody.appendChild(row);
        });
    }).catch((error) => {
        console.error('Erro ao carregar dados do Firebase:', error);
    });
}

// Calculate averages for each user
function calculateAverages(userRatings) {
    const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length || 0;
    return {
        serve: average(userRatings.serve).toFixed(2),
        attack: average(userRatings.attack).toFixed(2),
        block: average(userRatings.block).toFixed(2),
        set: average(userRatings.set).toFixed(2),
        reception: average(userRatings.reception).toFixed(2)
    };
}

// Load rankings for ranking tab
function loadRankings() {
    const ratingsRef = firebase.database().ref('ratings');

    ratingsRef.once('value', (snapshot) => {
        const ratings = snapshot.val();

        if (!ratings) {
            console.log('Sem dados disponíveis.');
            return;
        }

        const usersAverages = {};

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

        const rankingTableBody = document.getElementById('rankingTableBody');
        rankingTableBody.innerHTML = '';

        const userAverageArray = Object.keys(usersAverages).map(user => {
            const averages = calculateAverages(usersAverages[user]);
            return {
                user: user,
                average: ((parseFloat(averages.serve) + parseFloat(averages.attack) + parseFloat(averages.block) + parseFloat(averages.set) + parseFloat(averages.reception)) / 5).toFixed(2)
            };
        });

        userAverageArray.sort((a, b) => b.average - a.average);

        userAverageArray.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.user}</td>
                <td>${user.average}</td>
            `;
            rankingTableBody.appendChild(row);
        });
    }).catch((error) => {
        console.error('Erro ao carregar dados do Firebase:', error);
    });
}

// Open tab and load data
function openTab(evt, tabName) {
    const tabcontent = document.querySelectorAll('.tabcontent');
    tabcontent.forEach(tab => tab.style.display = 'none');

    const tablinks = document.querySelectorAll('.tab button');
    tablinks.forEach(tab => tab.className = tab.className.replace(' active', ''));

    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';

    if (tabName === 'Visualization') {
        loadAverages();
    } else if (tabName === 'Ranking') {
        loadRankings();
    } else if (tabName === 'Teams') {
        loadAveragesForTeams();
    }
}

// Load averages for team generation
function loadAveragesForTeams() {
    const ratingsRef = firebase.database().ref('ratings');

    ratingsRef.once('value', (snapshot) => {
        const ratings = snapshot.val();

        if (!ratings) {
            console.log('Sem dados disponíveis.');
            return;
        }

        const usersAverages = {};

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

        const teams = createBalancedTeams(usersAverages);
        displayTeams(teams);
    }).catch((error) => {
        console.error('Erro ao carregar dados do Firebase:', error);
    });
}

// Create balanced teams
function createBalancedTeams(usersAverages) {
    const users = Object.keys(usersAverages).map(user => {
        const averages = calculateAverages(usersAverages[user]);
        return {
            user: user,
            averages: averages
        };
    });

    users.sort((a, b) => {
        return (parseFloat(b.averages.serve) + parseFloat(b.averages.attack) + parseFloat(b.averages.block) + parseFloat(b.averages.set) + parseFloat(b.averages.reception)) -
               (parseFloat(a.averages.serve) + parseFloat(a.averages.attack) + parseFloat(a.averages.block) + parseFloat(a.averages.set) + parseFloat(a.averages.reception));
    });

    const teams = [];
    const teamCount = Math.ceil(users.length / 6);

    for (let i = 0; i < teamCount; i++) {
        teams.push([]);
    }

    let teamIndex = 0;
    users.forEach(user => {
        teams[teamIndex].push(user);
        teamIndex = (teamIndex + 1) % teamCount;
    });

    return teams;
}

// Display teams
function displayTeams(teams) {
    const teamsContainer = document.getElementById('teamsContainer');
    teamsContainer.innerHTML = '';

    teams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';
        teamDiv.innerHTML = `<h4>Time ${index + 1} (Média do time: ${calculateTeamAverage(team).toFixed(2)})</h4>`;

        const teamList = document.createElement('ul');

        team.forEach(player => {
            const position = getSuggestedPosition(player.averages);
            const listItem = document.createElement('li');
            const convert = {
                'Saque': 'Ponta/Fundo',
                'Recepção': 'Meio/Fundo',
                'Levantamento': 'Levantador/Meio',
                'Ataque': 'Ponta',
                'Bloqueio': 'Levantador/Ponta'
            }
            //: (Saque: ${player.averages.serve}, Ataque: ${player.averages.attack}, Bloqueio: ${player.averages.block}, Levantamento: ${player.averages.set}, Recepção: ${player.averages.reception})
            listItem.textContent = `${player.user} | Posição SUGERIDA: ${convert[position]}`;
            teamList.appendChild(listItem);
        });

        teamDiv.appendChild(teamList);
        teamsContainer.appendChild(teamDiv);
    });
}

// Calculate team average rating
function calculateTeamAverage(team) {
    const numPlayers = team.length;
    if (numPlayers === 0) return 0;

    const totalServe = team.reduce((acc, player) => acc + parseFloat(player.averages.serve), 0);
    const totalAttack = team.reduce((acc, player) => acc + parseFloat(player.averages.attack), 0);
    const totalBlock = team.reduce((acc, player) => acc + parseFloat(player.averages.block), 0);
    const totalSet = team.reduce((acc, player) => acc + parseFloat(player.averages.set), 0);
    const totalReception = team.reduce((acc, player) => acc + parseFloat(player.averages.reception), 0);

    const averageServe = totalServe / numPlayers;
    const averageAttack = totalAttack / numPlayers;
    const averageBlock = totalBlock / numPlayers;
    const averageSet = totalSet / numPlayers;
    const averageReception = totalReception / numPlayers;

    return (averageServe + averageAttack + averageBlock + averageSet + averageReception) / 5;
}

// Get suggested position based on best rating
function getSuggestedPosition(averages) {
    const positions = {
        serve: 'Saque',
        attack: 'Ataque',
        block: 'Bloqueio',
        set: 'Levantamento',
        reception: 'Recepção'
    };

    let bestSkill = 'serve';
    let bestRating = averages.serve;

    for (let skill in averages) {
        if (parseFloat(averages[skill]) > bestRating) {
            bestSkill = skill;
            bestRating = averages[skill];
        }
    }

    return positions[bestSkill];
}

// Delete user data
function deleteUser(username) {
    const ratingsRef = firebase.database().ref('ratings');

    ratingsRef.once('value', (snapshot) => {
        const ratings = snapshot.val();

        if (!ratings) {
            console.log('Sem dados disponíveis.');
            return;
        }

        Object.keys(ratings).forEach((key) => {
            if (ratings[key].username === username) {
                firebase.database().ref(`ratings/${key}`).remove();
            }
        });

        loadAverages();
        loadRankings();
    }).catch((error) => {
        console.error('Erro ao carregar dados do Firebase:', error);
    });
}

// Load initial data
loadUsernames();
