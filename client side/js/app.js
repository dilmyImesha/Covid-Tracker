const countrySelect = document.getElementById("countrySelect");
const infoCard = document.getElementById("infoCard");
const saveBtn = document.getElementById("saveBtn");

let currentUserToken = null;
let currentSnapshot = null;

// -----------------------------
// 1) GOOGLE LOGIN HANDLER
// -----------------------------
function handleCredentialResponse(response) {
    currentUserToken = response.credential; // Google ID token
    alert("Login successful!");
}

// -----------------------------
// 2) LOAD COUNTRIES
// -----------------------------
async function loadCountries() {
    const res = await fetch("https://restcountries.com/v3.1/all");
    const countries = await res.json();

    countries.sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
    );

    countries.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.cca2 || c.name.common;
        opt.textContent = c.name.common;
        countrySelect.appendChild(opt);
    });
}

loadCountries();

// -----------------------------
// 3) FETCH + MERGE DATA
// -----------------------------
async function fetchAndShow(code) {
    try {
        const infoRes = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
        const meta = (await infoRes.json())[0];

        const covidRes = await fetch(
            `https://disease.sh/v3/covid-19/countries/${meta.name.common}?strict=true`
        );
        const covid = await covidRes.json();

        const merged = {
            country: meta.name.common,
            cca2: meta.cca2,
            capital: meta.capital?.[0] || "N/A",
            region: meta.region,
            population: meta.population,
            currencies: meta.currencies,
            flag: meta.flags?.png,
            covidStats: {
                cases: covid.cases,
                todayCases: covid.todayCases,
                deaths: covid.deaths,
                todayDeaths: covid.todayDeaths,
                recovered: covid.recovered,
                active: covid.active,
                updated: covid.updated
            }
        };

        currentSnapshot = merged;
        renderCard(merged);

    } catch (err) {
        console.error(err);
        alert("Error fetching data");
    }
}

countrySelect.addEventListener("change", () => {
    fetchAndShow(countrySelect.value);
});

// -----------------------------
// 4) SHOW UI CARD
// -----------------------------
function renderCard(data) {
    infoCard.innerHTML = `
        <div class="card-custom mt-3">
            <h3>${data.country}</h3>
            <img src="${data.flag}" class="country-flag mb-3">

            <p><strong>Region:</strong> ${data.region}</p>
            <p><strong>Capital:</strong> ${data.capital}</p>
            <p><strong>Population:</strong> ${data.population.toLocaleString()}</p>

            <hr>

            <h5>COVID-19 Stats</h5>
            <p><strong>Total Cases:</strong> ${data.covidStats.cases}</p>
            <p><strong>Deaths:</strong> ${data.covidStats.deaths}</p>
            <p><strong>Recovered:</strong> ${data.covidStats.recovered}</p>
            <p><strong>Active:</strong> ${data.covidStats.active}</p>
        </div>
    `;
}

// -----------------------------
// 5) SAVE SNAPSHOT TO BACKEND
// -----------------------------
saveBtn.addEventListener("click", async () => {
    if (!currentUserToken) {
        return alert("Please log in with Google first.");
    }
    if (!currentSnapshot) {
        return alert("Select a country first.");
    }

    const res = await fetch("YOUR_BACKEND_URL/api/records", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentUserToken}`,
            "x-api-key": "YOUR_PUBLIC_API_KEY"
        },
        body: JSON.stringify(currentSnapshot)
    });

    const data = await res.json();
    alert(data.message || "Saved successfully!");
});
