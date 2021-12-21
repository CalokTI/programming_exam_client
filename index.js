const partyArray = ["Socialdemokratiet", "Radikale Venstre", "Det Konservative Folkeparti",
    "Nye Borgerlige", "Socialistisk Folkeparti", "Veganerpartiet", "Liberal Alliance",
    "Kristendemokraterne", "Dansk Folkeparti", "Frie Grønne", "Venstre", "Enhedslisten", "Alternativet"];
const partyLetters = ["A", "B", "C", "D", "F", "G", "I", "K", "O", "Q", "V", "Ø", "Å"];

//<editor-fold desc="Run on site access">
fetch(baseURL + candidatesEndpoint)
    .then(response => response.json())
    .then(candidates => {
        candidates.map(createCandidate);
    })

const candidatesSection = document.getElementById("candidates-list");

function createCandidate(candidate) {
    const candidateDiv = document.createElement("div");

    //assign class list elements
    let className = "party-" + escapeHTML(candidate.party.letter);
    candidateDiv.classList.add(className);
    candidateDiv.classList.add("candidate-card");
    candidateDiv.id = "candidateId-" + candidate.id;


    //setup content for container
    candidateDiv.innerHTML = `
        <div class="candidate-image">
        <img src="https://kb.rspca.org.au/wp-content/uploads/2018/11/golder-retriever-puppy.jpeg" alt="dog" height="200px">
        </div>
        <div class="candidate-text">
            <strong>${escapeHTML(candidate.name)}</strong>
            <p>Votes: ${escapeHTML(candidate.votes.toString())}</p>
            <p class="party-letter">${escapeHTML(candidate.party.letter)}</p>
            <p>${escapeHTML(candidate.party.partyName)}</p>
        </div>
    `;

    candidatesSection.appendChild(candidateDiv);
}

//</editor-fold>

//<editor-fold desc="Filtering">
//filter and search
const buttonDiv = document.getElementById("filter-buttons");

partyLetters.map(letter => {
    let letterButton = document.createElement("button");
    letterButton.innerText = letter;
    letterButton.classList.add("party-letter");
    letterButton.classList.add("party-letter-button");
    letterButton.id = "party-letter-" + letter;

    //adds eventListener that filters out candidate-cards based on class ("party-F")
    letterButton.addEventListener('click', () => {
        document.querySelectorAll('.candidate-card').forEach(function (element) {
            if (element.classList.contains("party-" + letter)) {
                element.style.display = '';
            } else {
                element.style.display = "none";
            }
        })
    })

    buttonDiv.appendChild(letterButton);
})

document.getElementById("button-show-all").addEventListener('click', () => {
    document.querySelectorAll('.candidate-card').forEach(function (element) {
        element.style.display = '';
    })
})

//filter candidates based on input, checks name, votes, party letter and party name
const input = document.getElementById("search-candidate");
input.addEventListener('keyup', function () {

    const nodeList = document.querySelectorAll('.candidate-card');

    for (let i = 0; i < nodeList.length; i++) {
        let a = nodeList[i].childNodes[3].textContent;

        if (a.toUpperCase().indexOf(this.value.toUpperCase()) > -1) {
            nodeList[i].style.display = "";
        } else {
            nodeList[i].style.display = "none";
        }
    }
})
//</editor-fold>

//<editor-fold desc="Sorting">
//sort elements
document.getElementById("button-sort-party").addEventListener('click', () => {
    let selectorAll = document.querySelectorAll('.candidate-card');
    let arrayOfCandidates = Array.from(selectorAll);
    let sortedArray = arrayOfCandidates.sort(compareLetter);
    sortedArray.forEach(e => {
        document.querySelector("#candidates-list").appendChild(e);
    })
    letterToggle = !letterToggle;
})

//using class name for sorting
let letterToggle = true;
function compareLetter(a, b) {
    if(letterToggle) {
        if (a.classList[0] < b.classList[0])
            return -1;
        if (a.classList[0] > b.classList[0])
            return 1;
        return 0;
    }else {
        if (a.classList[0] < b.classList[0])
            return 1;
        if (a.classList[0] > b.classList[0])
            return -1;
        return 0;
    }
}

document.getElementById("button-sort-votes").addEventListener('click', () => {
    let selectorAll = document.querySelectorAll('.candidate-card');
    let arrayOfCandidates = Array.from(selectorAll);
    let sortedArray = arrayOfCandidates.sort(compareVotes);
    sortedArray.forEach(e => {
        document.querySelector("#candidates-list").appendChild(e);
    })
    votesToggle = !votesToggle;
})

//grab text string of votes, split it and convert to int
let votesToggle = true;
function compareVotes(a, b) {
    let aArray = a.lastElementChild.children[1].innerText.split(" ");
    let bArray = b.lastElementChild.children[1].innerText.split(" ");
    let aValue = parseInt(aArray[1]);
    let bValue = parseInt(bArray[1]);

    if(votesToggle) {
        if (aValue < bValue)
            return -1;
        if (aValue > bValue)
            return 1;
        return 0;
    }else{
        if (aValue < bValue)
            return 1;
        if (aValue > bValue)
            return -1;
        return 0;
    }
}

//</editor-fold>

//<editor-fold desc="Create, update and delete of candidates">

let buttonModOpen = document.getElementById('button-mod-open');
let modDiv = document.getElementById("mod-opened")

buttonModOpen.addEventListener('click', () => {
    buttonModOpen.style.display = "none";

    modDiv.innerHTML = `
        <button id="button-mod-close">Close modifying</button>
        <input type="text" id="mod-create-candidate-name" placeholder="candidate name">
        <input type="number" id="mod-create-candidate-votes" placeholder="votes" min="0" max="100000">
        <select id="mod-create-candidate-party">
        </select>
        <button id="mod-create-candidate-button">Opret Kandidat</button>
    `;

    fillSelect("mod-create-candidate-party");
    document.getElementById("mod-create-candidate-button").addEventListener('click', saveCandidateToDatabase)

    const nodeList = document.querySelectorAll('.candidate-card');
    nodeList.forEach(function (element) {
        let buttonX = document.createElement("button");
        buttonX.classList.add("button-delete");
        buttonX.classList.add("modifier-remove-on-close");
        buttonX.textContent = "❌";
        buttonX.addEventListener('click', () => {
            deleteCandidate(element.id);
        })

        let buttonEdit = document.createElement("button");
        buttonEdit.classList.add("button-edit");
        buttonEdit.classList.add("modifier-remove-on-close");
        buttonEdit.textContent = "📝";
        buttonEdit.addEventListener('click', () => {
            changeTextToInput(element.id)
        })

        element.appendChild(buttonX);
        element.appendChild(buttonEdit);
    })


    //on close, remove all mods and restore mod access button
    document.getElementById("button-mod-close").addEventListener('click', () => {
        modDiv.innerHTML = "";
        buttonModOpen.style.display = "";
        document.querySelectorAll('.modifier-remove-on-close').forEach(function (element) {
            element.remove();
        })
    })
})

function fillSelect(id) {
    let selectElement = document.getElementById(id);
    partyArray.map(option => {
        selectElement.options.add(new Option(option, option)) //text, value
    })
}

function changeTextToInput(id) {
    let name = document.getElementById(id).children[1].children[0].textContent;
    let votes = document.getElementById(id).children[1].children[1].textContent;

    document.getElementById(id).children[1].innerHTML = `
        <input id="${id + "-name"}"type="text" placeholder="navn">
        <input id="${id + "-votes"}"type="number" placeholder="stemmer" min="0" max="100000">
        <select id="${id + "-party"}"></select>
        <button id="${id + "-button"}">Gem ændringer</button>
    `;

    document.getElementById(id + "-name").value = name;
    document.getElementById(id + "-votes").value = votes.split(" ")[1];
    fillSelect(id + "-party");
    document.getElementById(id + "-button").addEventListener('click', () => {
        patchCandidate(id)
    })

}


function saveCandidateToDatabase() {

    let name = document.getElementById("mod-create-candidate-name").value;
    let votes = document.getElementById("mod-create-candidate-votes").value;
    let party = document.getElementById("mod-create-candidate-party").value;
    let partyLetter = partyLetters[partyArray.indexOf(party)];

    const newCandidate = {
        name: name,
        votes: votes,
        party: {"letter": partyLetter}
    }

    fetch(baseURL + candidatesEndpoint, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(newCandidate)
    })
        .then(response => {
            if (response.status === 200) {
                createCandidate(newCandidate)
            } else {
                console.log("Something went wrong, artist not created. " + response.status)
            }
        })
        .catch(error => console.log("Network issue", error))


}

function patchCandidate(candidateId) {
    let name = document.getElementById(candidateId + "-name").value;
    let votes = document.getElementById(candidateId + "-votes").value;
    let party = document.getElementById(candidateId + "-party").value;
    let partyLetter = partyLetters[partyArray.indexOf(party)];

    console.log(candidateId)

    const updatedCandidate = {
        name: name,
        votes: votes,
        party: {"letter": partyLetter}
    }


    fetch(baseURL + candidatesEndpoint + "/" + candidateId.split("-")[1], {
        method: "PATCH",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(updatedCandidate)
    })
        .then(response => {
            if (response.status === 200) {
                document.getElementById(candidateId).children[1].innerHTML = `
                    <strong>${name}</strong>
                    <p>Votes: ${votes}</p>
                    <p class="party-letter">${partyLetter}</p>
                    <p>${party}</p>
                `;
            }
        })
        .catch(error => console.log("Network issue", error))
}

function deleteCandidate(candidateId) {
    console.log("deleted candidate with id: " + candidateId);
    fetch(baseURL + candidatesEndpoint + "/" + candidateId.split("-")[1], {
        method: "DELETE",
    })
        .then(response => {
            if (response.status === 200) {
                document.getElementById(candidateId).remove();
            } else {
                console.log("Can't delete " + response.status)
            }
        })
        .catch(error => console.log("Network issue", error))
}

//</editor-fold>