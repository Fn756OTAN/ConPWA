// API KEY y URL base
const URL_BASE = 'https://api.themoviedb.org/3';
const ID = '876077';

// Cuando carga la página, traer los datos
cargarPelicula();

async function cargarPelicula() {
    try {
        const respuestaPelicula = await fetch(`${URL_BASE}/movie/${ID}?api_key=${API_KEY}&language=es-MX`);
        const respuestaCredits  = await fetch(`${URL_BASE}/movie/${ID}/credits?api_key=${API_KEY}&language=es-MX`);

        const pelicula = await respuestaPelicula.json();
        const credits  = await respuestaCredits.json();

        if (pelicula.backdrop_path) {
            document.getElementById('backdrop-bg').style.backgroundImage =
                `url(https://image.tmdb.org/t/p/w1280${pelicula.backdrop_path})`;
        }

        document.getElementById('loading').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        mostrarInfo(pelicula);
        mostrarElenco(credits.cast);
        mostrarDuracion(pelicula);

        setTimeout(() => {
            const barra = document.getElementById('ratingFill');
            if (barra) {
                barra.style.width = (pelicula.vote_average / 10 * 100) + '%';
            }
        }, 300);

    } catch (err) {
        console.error('Error cargando película:', err);
        document.getElementById('loading').textContent = 'Error al cargar. Revisa tu conexión.';
    }
}

// ── TAB: INFORMACIÓN ──────────────────────────────────────
function mostrarInfo(pelicula) {
    let generos = '';
    for (let i = 0; i < pelicula.genres.length; i++) {
        generos += `<span class="genre-pill">${pelicula.genres[i].name}</span>`;
    }

    const fecha = new Date(pelicula.release_date).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    document.getElementById('bento-info').innerHTML = `
        <div class="card card-poster">
            <img src="https://image.tmdb.org/t/p/w500${pelicula.poster_path}" alt="${pelicula.title}"/>
            <div class="poster-meta">
                <span class="status-badge">${pelicula.status}</span>
                <div><div class="stat-label">Idioma</div><div class="lang-tag">${pelicula.original_language.toUpperCase()}</div></div>
                <div><div class="stat-label">País</div><div class="lang-tag">${pelicula.origin_country.join(', ')}</div></div>
                <div><div class="stat-label">Duración</div><div class="lang-tag">${pelicula.runtime} min</div></div>
            </div>
        </div>

        <div class="card card-title">
            ${pelicula.tagline ? `<div class="tagline">"${pelicula.tagline}"</div>` : ''}
            <h1>${pelicula.title}</h1>
            <div class="original-title">${pelicula.original_title}</div>
            <div class="genres">${generos}</div>
        </div>

        <div class="card card-stats">
            <div class="stat-label">Calificación</div>
            <div class="stat-value big">${pelicula.vote_average.toFixed(1)}<span style="font-size:1.2rem;color:var(--muted)">/10</span></div>
            <div class="rating-bar"><div class="rating-fill" id="ratingFill"></div></div>
            <div class="stats-row" style="margin-top:12px">
                <div class="stat-item"><div class="stat-label">Votos</div><div class="stat-value">${pelicula.vote_count.toLocaleString()}</div></div>
                <div class="stat-item"><div class="stat-label">Año</div><div class="stat-value">${pelicula.release_date.slice(0,4)}</div></div>
                <div class="stat-item" style="grid-column:1/-1"><div class="stat-label">Popularidad</div><div class="stat-value">${pelicula.popularity.toFixed(1)}</div></div>
            </div>
        </div>

        <div class="card card-overview">
            <div class="label">Sinopsis</div>
            <p>${pelicula.overview || 'Sin descripción disponible.'}</p>
        </div>

        <div class="details-row">
            <div class="detail-item"><div class="stat-label">Estreno</div><div class="detail-value">${fecha}</div></div>
            <div class="detail-item"><div class="stat-label">Presupuesto</div><div class="detail-value">${pelicula.budget > 0 ? '$' + pelicula.budget.toLocaleString() : 'N/D'}</div></div>
            <div class="detail-item"><div class="stat-label">Recaudación</div><div class="detail-value">${pelicula.revenue > 0 ? '$' + pelicula.revenue.toLocaleString() : 'N/D'}</div></div>
            <div class="detail-item"><div class="stat-label">Sitio oficial</div><div class="detail-value">${pelicula.homepage ? `<a href="${pelicula.homepage}" target="_blank" style="color:var(--accent);text-decoration:none">Visitar →</a>` : 'N/D'}</div></div>
        </div>
    `;
}

// ── TAB: ELENCO ───────────────────────────────────────────
function mostrarElenco(cast) {
    const actores = cast.slice(0, 20);
    let html = '';

    for (let i = 0; i < actores.length; i++) {
        const actor = actores[i];
        const foto = actor.profile_path
            ? `<img src="https://image.tmdb.org/t/p/w185${actor.profile_path}" alt="${actor.name}" loading="lazy"/>`
            : `<div class="cast-no-photo">👤</div>`;

        html += `
            <div class="cast-card">
                ${foto}
                <div class="cast-info">
                    <div class="cast-name">${actor.name}</div>
                    <div class="cast-character">${actor.character}</div>
                </div>
            </div>
        `;
    }

    document.getElementById('cast-grid').innerHTML = html;
}

// ── TAB: DURACIÓN ─────────────────────────────────────────
function mostrarDuracion(pelicula) {
    const mins   = pelicula.runtime;
    const horas  = Math.floor(mins / 60);
    const minRem = mins % 60;

    const referencias = [
        { nombre: 'Cortometraje promedio',         mins: 20  },
        { nombre: 'Comedia típica',                mins: 95  },
        { nombre: 'Drama típico',                  mins: 120 },
        { nombre: 'Acción típica',                 mins: 130 },
        { nombre: 'El Señor de los Anillos: ROTK', mins: 201 },
    ];

    const maxMins = Math.max(...referencias.map(r => r.mins), mins);
    const pctFilm = (mins / maxMins) * 100;

    const act1 = Math.round(mins * 0.25);
    const act2 = Math.round(mins * 0.50);
    const act3 = mins - act1 - act2;

    let comparaciones = '';
    for (let i = 0; i < referencias.length; i++) {
        const ref       = referencias[i];
        const pct       = (ref.mins / maxMins) * 100;
        const diff      = mins - ref.mins;
        const diffTexto = diff > 0 ? `+${diff} min más larga` : `${Math.abs(diff)} min más corta`;
        const diffClase = diff > 0 ? 'diff-pos' : 'diff-neg';

        comparaciones += `
            <div class="comp-item">
                <div class="comp-header">
                    <span class="comp-name">${ref.nombre}</span>
                    <span class="comp-mins">${ref.mins} min</span>
                </div>
                <div class="comp-bar-track">
                    <div class="comp-bar-fill other" data-target="${pct}" style="width:0%"></div>
                </div>
                <div class="comp-diff ${diffClase}">${diffTexto}</div>
            </div>
        `;
    }

    document.getElementById('duracion-grid').innerHTML = `
        <div class="dur-card">
            <div class="dur-title">Duración total</div>
            <div class="dur-big">${horas}h ${minRem}m</div>
            <div class="dur-sub">${mins} minutos en total</div>
        </div>

        <div class="dur-card">
            <div class="dur-title">Equivalencias</div>
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
                <div class="stat-item"><div class="stat-label">Episodios de 30 min</div><div class="stat-value">${(mins / 30).toFixed(1)}</div></div>
                <div class="stat-item"><div class="stat-label">Episodios de 45 min</div><div class="stat-value">${(mins / 45).toFixed(1)}</div></div>
                <div class="stat-item"><div class="stat-label">Veces al día que cabe</div><div class="stat-value">${Math.floor(1440 / mins)}</div></div>
            </div>
        </div>

        <div class="dur-card full">
            <div class="dur-title">Distribución aproximada</div>
            <div class="time-bar-wrap">
                <div class="time-label"><span>Inicio</span><span>${mins} min</span></div>
                <div class="time-track">
                    <div class="time-segment seg-act1" data-target="${(act1/mins)*100}" style="width:0%;left:0"></div>
                    <div class="time-segment seg-act2" data-target="${(act2/mins)*100}" style="width:0%;left:${(act1/mins)*100}%"></div>
                    <div class="time-segment seg-act3" data-target="${(act3/mins)*100}" style="width:0%;left:${((act1+act2)/mins)*100}%"></div>
                </div>
                <div class="time-legend">
                    <div class="legend-item"><div class="legend-dot" style="background:var(--accent2)"></div>Acto 1 (~${act1} min)</div>
                    <div class="legend-item"><div class="legend-dot" style="background:var(--accent)"></div>Acto 2 (~${act2} min)</div>
                    <div class="legend-item"><div class="legend-dot" style="background:#e87d6d"></div>Acto 3 (~${act3} min)</div>
                </div>
            </div>
        </div>

        <div class="dur-card full">
            <div class="dur-title">Comparación con otras películas</div>
            <div style="margin-bottom:16px">
                <div class="comp-header">
                    <span class="comp-name" style="color:var(--accent);font-weight:700">${pelicula.title}</span>
                    <span class="comp-mins" style="color:var(--accent)">${mins} min</span>
                </div>
                <div class="comp-bar-track">
                    <div class="comp-bar-fill current" data-target="${pctFilm}" style="width:0%"></div>
                </div>
            </div>
            <div class="comp-list">${comparaciones}</div>
        </div>
    `;
}

// ── TAB: EXPLORAR ─────────────────────────────────────────
async function masFuncion() {
    const endpoints = document.querySelector('#mas').value;
    const language  = document.querySelector('#language').value;
    const page      = document.querySelector('#page').value;
    const url = `${URL_BASE}/movie/${endpoints}?api_key=${API_KEY}&language=${language}&page=${page}`;
    const data = await fetch(url);
    const json = await data.json();
    return json;
}

document.addEventListener('DOMContentLoaded', () => {
    const lista = document.querySelector('#segunda');
    if (!lista) return;

    lista.addEventListener('submit', async (event) => {
        event.preventDefault();

        const btn      = document.querySelector('#btn1');
        const btnText  = btn.querySelector('.btn1-text');
        const spinner  = btn.querySelector('.btn1-spinner');
        const empty    = document.getElementById('explorar-empty');
        const output2  = document.getElementById('output2');

        // Estado: cargando
        btn.disabled   = true;
        btnText.style.display  = 'none';
        spinner.style.display  = 'inline';

        try {
            const resultado = await masFuncion();

            empty.style.display = 'none';
            output2.innerHTML   = '';

            if (!resultado.results || resultado.results.length === 0) {
                empty.style.display = 'flex';
                empty.querySelector('.explorar-empty-text').textContent = 'No se encontraron resultados.';
                return;
            }

            for (let i = 0; i < resultado.results.length; i++) {
                const item  = resultado.results[i];
                const titulo = item.title || item.name || 'Sin título';
                const review = item.overview || 'Sin descripción disponible.';
                const rating = item.vote_average ? item.vote_average.toFixed(1) : '—';
                const year   = item.release_date ? item.release_date.slice(0, 4) : '';
                const img    = item.poster_path
                    ? `<img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${titulo}" loading="lazy"/>`
                    : `<div class="explorar-no-img">🎬</div>`;

                output2.innerHTML += `
                    <div class="explorar-card">
                        <div class="explorar-poster">
                            ${img}
                            <div class="explorar-rating">⭐ ${rating}</div>
                        </div>
                        <div class="explorar-info">
                            <div class="explorar-titulo">${titulo}</div>
                            ${year ? `<div class="explorar-year">${year}</div>` : ''}
                            <div class="explorar-overview">${review}</div>
                        </div>
                    </div>
                `;
            }

        } catch (err) {
            console.error('Error en Explorar:', err);
            empty.style.display = 'flex';
            empty.querySelector('.explorar-empty-text').textContent = 'Error al cargar. Revisa tu conexión.';
        } finally {
            // Restaurar botón
            btn.disabled          = false;
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
        }
    });
});

// ── CAMBIAR TAB ───────────────────────────────────────────
let duracionAnimada = false;

function switchTab(tab, e) {
    const clickedBtn = e ? e.target : event.target;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(div => div.classList.remove('active'));

    clickedBtn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');

    if (tab === 'duracion' && !duracionAnimada) {
        duracionAnimada = true;
        setTimeout(() => {
            document.querySelectorAll('.comp-bar-fill, .time-segment').forEach(el => {
                if (el.dataset.target) {
                    el.style.width = el.dataset.target + '%';
                }
            });
        }, 100);
    }
}
