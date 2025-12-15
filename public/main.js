const btn = document.getElementById("btn");

const userEl = document.getElementById("user");
const countryEl = document.getElementById("country");
const exchangeEl = document.getElementById("exchange");
const exchangeHeroEl = document.getElementById("exchange-hero");
let exchangeCode = null;
const newsEl = document.getElementById("news");

let activeController = null;
let runId = 0;

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function setLoading(targetEl, label) {
    targetEl.innerHTML = `
    <div class="skeletonBlock">
      <div class="skeleton line w40"></div>
      <div class="skeleton line w70"></div>
      <div class="skeleton line w55"></div>
      <div class="skeleton line w65"></div>
    </div>
    <div class="hint">${escapeHtml(label)}</div>
  `;
}

function setError(targetEl, title, details) {
    targetEl.innerHTML = `
    <div class="state error">
      <div class="stateTitle">${escapeHtml(title)}</div>
      <div class="stateText">${escapeHtml(details || "Something went wrong")}</div>
    </div>
  `;
}

function setEmpty(targetEl, message) {
    targetEl.innerHTML = `
    <div class="state empty">
      <div class="stateTitle">${escapeHtml(message)}</div>
    </div>
  `;
}

async function fetchJson(url, { signal } = {}) {
    const res = await fetch(url, { signal });
    let payload = null;
    try {
        payload = await res.json();
    } catch {
        payload = null;
    }
    if (!res.ok) {
        const message = payload?.message || `Request failed (${res.status})`;
        throw new Error(message);
    }
    return payload;
}

function kv(label, value) {
    return `
    <div class="kv">
      <div class="k">${escapeHtml(label)}</div>
      <div class="v">${escapeHtml(value)}</div>
    </div>
  `;
}

function renderUser(user) {
    const dob = user?.dateOfBirth ? new Date(user.dateOfBirth) : null;
    const dobText = dob && !Number.isNaN(dob.getTime()) ? dob.toLocaleDateString() : "—";

    userEl.innerHTML = `
    <div class="user">
      <img class="avatar" src="${escapeHtml(user.picture)}" alt="Profile photo" loading="lazy" />
      <div class="userMeta">
        <div class="userName">${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</div>
        <div class="pillRow">
          <span class="pill">${escapeHtml(user.gender)}</span>
          <span class="pill">${escapeHtml(user.age)} years</span>
        </div>
      </div>
    </div>
    <div class="kvGrid">
      ${kv("Date of birth", dobText)}
      ${kv("City", user.city)}
      ${kv("Country", user.country)}
      ${kv("Address", user.address)}
    </div>
  `;
}

function renderCountry(country) {
    const capital = Array.isArray(country.capital) ? country.capital.join(", ") : (country.capital ?? "—");
    const languages = country.languages ? Object.values(country.languages).join(", ") : "—";
    const currency = country.currency ?? "—";

    countryEl.innerHTML = `
    <div class="country">
        <img class="flag" src="${escapeHtml(country.flags)}" alt="Flag" loading="lazy" />
        <div class="countryMeta">
            <div class="countryName">${escapeHtml(country.name)}</div>
        </div>
    </div>
    <div class="kvGrid">
        ${kv("Capital", capital)}
        ${kv("Languages", languages)}
        ${kv("Currency", currency)}
    </div>
  `;
}

function renderExchange(exchange) {
    const usd = typeof exchange?.usd === "number" ? exchange.usd : null;
    const eur = typeof exchange?.eur === "number" ? exchange.eur : null;

  if (exchangeHeroEl) {
    exchangeHeroEl.textContent = exchangeCode
      ? `Exchange Rates for ${escapeHtml(exchangeCode)}`
      : "Exchange Rates";
  }

    exchangeEl.innerHTML = `
    <div class="bigNumbers">
      <div class="bigNumber">
        <div class="bigLabel">USD</div>
        <div class="bigValue">${usd ?? "—"}</div>
      </div>
      <div class="bigNumber">
        <div class="bigLabel">EUR</div>
        <div class="bigValue">${eur ?? "—"}</div>
      </div>
    </div>
  `;
}

function renderNews(articles) {
    if (!Array.isArray(articles) || articles.length === 0) {
        setEmpty(newsEl, "No headlines found");
        return;
    }

    const top = articles.slice(0, 6);
    newsEl.innerHTML = `
    <div class="newsGrid">
      ${top
            .map((a) => {
                const hasImage = Boolean(a?.image);
                const img = hasImage
                    ? `<img class="newsImg" src="${escapeHtml(a.image)}" alt="" loading="lazy" />`
                    : `<div class="newsImg placeholder" aria-hidden="true"></div>`;
                const title = a?.title || "Untitled";
                const desc = a?.description || "";
                const source = a?.source || "";
                const url = a?.url || "#";
                return `
            <a class="newsCard" href="${escapeHtml(url)}" target="_blank" rel="noreferrer noopener">
              ${img}
              <div class="newsBody">
                <div class="newsTitle">${escapeHtml(title)}</div>
                ${desc ? `<div class="newsDesc">${escapeHtml(desc)}</div>` : ""}
                <div class="newsMeta">${escapeHtml(source)}</div>
              </div>
            </a>
          `;
            })
            .join("")}
    </div>
  `;
}

async function loadDashboard() {
    runId += 1;
    const thisRun = runId;

    if (activeController) activeController.abort();
    activeController = new AbortController();

    btn.disabled = true;
    btn.dataset.loading = "true";

    setLoading(userEl, "Fetching random user…");
    setLoading(countryEl, "Fetching country info…");
    setLoading(exchangeEl, "Fetching exchange rates…");
    setLoading(newsEl, "Fetching top headlines…");

    if (exchangeHeroEl) exchangeHeroEl.textContent = "Exchange Rates";
    exchangeCode = null;

    try {
        const user = await fetchJson("/api/random-user", { signal: activeController.signal });
        if (thisRun !== runId) return;
        renderUser(user);

        const country = await fetchJson("/api/country-full-info", { signal: activeController.signal });
        if (thisRun !== runId) return;
        renderCountry(country);

        exchangeCode = typeof country?.currency === "string" ? country.currency : null;
        if (exchangeHeroEl && exchangeCode) {
          exchangeHeroEl.textContent = `Exchange Rates for ${escapeHtml(exchangeCode)}`;
        }

        const exchange = await fetchJson("/api/exchange-rate", { signal: activeController.signal });
        if (thisRun !== runId) return;
        renderExchange(exchange);

        const news = await fetchJson("/api/news", { signal: activeController.signal });
        if (thisRun !== runId) return;
        renderNews(news);
    } catch (err) {
        setError(userEl, "Failed to load user", err?.message);
        setError(countryEl, "Failed to load country info", err?.message);
        setError(exchangeEl, "Failed to load exchange rates", err?.message);
        setError(newsEl, "Failed to load news headlines", err?.message);
    } finally {
        if (thisRun === runId) {
            btn.disabled = false;
            delete btn.dataset.loading;
        }
    }
}

btn.addEventListener("click", loadDashboard);

setEmpty(userEl, "Click “Get random user” to start");
setEmpty(countryEl, "Country info will appear here");
setEmpty(exchangeEl, "Exchange rates will appear here");
setEmpty(newsEl, "News headlines will appear here");
