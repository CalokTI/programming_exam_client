fetch(baseURL + partiesEndpoint)
    .then(response => response.json())
    .then(parties => {
        parties.map(party => totalVotes += party.votes);
        parties.map(createRow);
    })

let totalVotes = 0;
const tableBody = document.getElementById("table-body");
function createRow(party){
    const tableRow = document.createElement('tr');

    tableRow.innerHTML = `
    <td>${party.letter}</td>
    <td>${party.partyName}</td>
    <td class="tableNumbers">${party.votes}</td>
    <td id="${party.letter}-percent" class="tableNumbers"></td>
    `;

    tableBody.appendChild(tableRow);
    calculatePercent(party);
}


function calculatePercent(party){
    let percent = Math.round(((party.votes / totalVotes * 100) + Number.EPSILON) * 100) / 100;
    document.getElementById(party.letter + "-percent").innerText = percent.toString() + "%";
}