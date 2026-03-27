// API KEY y URL base
const URL_BASE = 'https://api.themoviedb.org/3';
const ID = '46434';

// Cuando carga la página, traer los datos
cargarSerie();

async function cargarSerie() {
    try {
        const respuestaSerie   = await fetch(`${URL_BASE}/tv/${ID}?api_key=${API_KEY}&language=es-MX`);
        const respuestaCredits = await fetch(`${URL_BASE}/tv/${ID}/credits?api_key=${API_KEY}&language=es-MX`);

        const serie   = await respuestaSerie.json();
        const credits = await respuestaCredits.json();

        // Si no hay sinopsis en español, buscarla en inglés
        if (!serie.overview) {
            const respuestaEN = await fetch(`${URL_BASE}/tv/${ID}?api_key=${API_KEY}&language=en-US`);
            const serieEN     = await respuestaEN.json();
            serie.overview    = serieEN.overview;
        }

        if (serie.backdrop_path) {
            document.getElementById('backdrop-bg').style.backgroundImage =
                `url(https://image.tmdb.org/t/p/w1280${serie.backdrop_path})`;
        }

        document.getElementById('loading').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        mostrarInfo(serie);
        mostrarElenco(credits.cast);
        mostrarDuracion(serie);

        setTimeout(() => {
            const barra = document.getElementById('ratingFill');
            if (barra) {
                barra.style.width = (serie.vote_average / 10 * 100) + '%';
            }
        }, 300);

    } catch (err) {
        console.error('Error cargando serie:', err);
        document.getElementById('loading').textContent = 'Error al cargar. Revisa tu conexión.';
    }
}

// ── TAB: INFORMACIÓN ──────────────────────────────────────
function mostrarInfo(serie) {
    let generos = '';
    for (let i = 0; i < serie.genres.length; i++) {
        generos += `<span class="genre-pill">${serie.genres[i].name}</span>`;
    }

    const fecha = new Date(serie.first_air_date).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const duracionEp = serie.episode_run_time && serie.episode_run_time.length > 0
        ? serie.episode_run_time[0] + ' min'
        : 'N/D';

    const pais = serie.origin_country && serie.origin_country.length > 0
        ? serie.origin_country.join(', ')
        : 'N/D';

    document.getElementById('bento-info').innerHTML = `
        <div class="card card-poster">
            <img src="https://image.tmdb.org/t/p/w500${serie.poster_path}" alt="${serie.name}"/>
            <div class="poster-meta">
                <span class="status-badge">${serie.status}</span>
                <div><div class="stat-label">Idioma</div><div class="lang-tag">${serie.original_language.toUpperCase()}</div></div>
                <div><div class="stat-label">País</div><div class="lang-tag">${pais}</div></div>
                <div><div class="stat-label">Ep. duración</div><div class="lang-tag">${duracionEp}</div></div>
            </div>
        </div>

        <div class="card card-title">
            ${serie.tagline ? `<div class="tagline">"${serie.tagline}"</div>` : ''}
            <h1>${serie.name}</h1>
            <div class="original-title">${serie.original_name}</div>
            <div class="genres">${generos}</div>
        </div>

        <div class="card card-stats">
            <div class="stat-label">Calificación</div>
            <div class="stat-value big">${serie.vote_average.toFixed(1)}<span style="font-size:1.2rem;color:var(--muted)">/10</span></div>
            <div class="rating-bar"><div class="rating-fill" id="ratingFill"></div></div>
            <div class="stats-row" style="margin-top:12px">
                <div class="stat-item"><div class="stat-label">Votos</div><div class="stat-value">${serie.vote_count.toLocaleString()}</div></div>
                <div class="stat-item"><div class="stat-label">Año</div><div class="stat-value">${serie.first_air_date.slice(0,4)}</div></div>
                <div class="stat-item" style="grid-column:1/-1"><div class="stat-label">Popularidad</div><div class="stat-value">${serie.popularity.toFixed(1)}</div></div>
            </div>
        </div>

        <div class="card card-overview">
            <div class="label">Sinopsis</div>
            <p>${serie.overview || 'Sin descripción disponible.'}</p>
        </div>

        <div class="details-row">
            <div class="detail-item">
                <div class="stat-label">Estreno</div>
                <div class="detail-value">${fecha}</div>
            </div>
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
                    <div class="cast-character">${actor.character || actor.roles?.[0]?.character || ''}</div>
                </div>
            </div>
        `;
    }

    document.getElementById('cast-grid').innerHTML = html;
}

// ── TAB: DURACIÓN ─────────────────────────────────────────
function mostrarDuracion(serie) {
    // Duración total estimada
    const epDur    = serie.episode_run_time && serie.episode_run_time.length > 0 ? serie.episode_run_time[0] : 0;
    const totalEps = serie.number_of_episodes || 0;
    const totalMin = epDur * totalEps;
    const horas    = Math.floor(totalMin / 60);
    const minRem   = totalMin % 60;

    // Temporadas (filtrar Season 0 / especiales)
    const temporadas = (serie.seasons || []).filter(s => s.season_number > 0);

    let tarjetasTemporadas = '';
    let totalCapitulosContado = 0;

    for (let i = 0; i < temporadas.length; i++) {
        const temp    = temporadas[i];
        const caps    = temp.episode_count || 0;
        const minTemp = epDur * caps;
        const hTemp   = Math.floor(minTemp / 60);
        const mTemp   = minTemp % 60;
        totalCapitulosContado += caps;

        const poster = temp.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w185${temp.poster_path}" alt="${temp.name}" class="temp-poster"/>`
            : `<div class="temp-poster temp-no-poster">📺</div>`;

        const estrenoTemp = temp.air_date
            ? new Date(temp.air_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
            : 'N/D';

        tarjetasTemporadas += `
            <div class="temp-card">
                ${poster}
                <div class="temp-info">
                    <div class="temp-nombre">${temp.name}</div>
                    <div class="temp-meta">
                        <span class="temp-badge">📺 ${caps} capítulos</span>
                        ${epDur > 0 ? `<span class="temp-badge">⏱ ${hTemp > 0 ? hTemp + 'h ' : ''}${mTemp}m total</span>` : ''}
                    </div>
                    <div class="temp-estreno">Estreno: ${estrenoTemp}</div>
                </div>
            </div>
        `;
    }

    // Comparación de barras (sin cambios)
    const referencias = [
        { nombre: 'Cortometraje promedio',         mins: 20  },
        { nombre: 'Comedia típica',                mins: 95  },
        { nombre: 'Drama típico',                  mins: 120 },
        { nombre: 'Acción típica',                 mins: 130 },
        { nombre: 'El Señor de los Anillos: ROTK', mins: 201 },
    ];

    const maxMins = Math.max(...referencias.map(r => r.mins), epDur || 60);
    const pctFilm = ((epDur || 60) / maxMins) * 100;

    let comparaciones = '';
    for (let i = 0; i < referencias.length; i++) {
        const ref       = referencias[i];
        const pct       = (ref.mins / maxMins) * 100;
        const diff      = (epDur || 0) - ref.mins;
        const diffTexto = diff > 0 ? `+${diff} min más largo` : `${Math.abs(diff)} min más corto`;
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
            <div class="dur-title">Duración total estimada</div>
            <div class="dur-big">${horas > 0 ? horas + 'h ' : ''}${minRem}m</div>
            <div class="dur-sub">${totalMin > 0 ? totalMin + ' minutos · ' : ''}${totalEps} capítulos en total</div>
        </div>

        <div class="dur-card">
            <div class="dur-title">Temporadas y Capítulos</div>
            <div class="temp-resumen">
                <div class="stat-item">
                    <div class="stat-label">Temporadas</div>
                    <div class="stat-value">${temporadas.length}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Capítulos totales</div>
                    <div class="stat-value">${totalCapitulosContado}</div>
                </div>
                ${epDur > 0 ? `
                <div class="stat-item" style="grid-column:1/-1">
                    <div class="stat-label">Duración por capítulo</div>
                    <div class="stat-value">${epDur} min</div>
                </div>` : ''}
            </div>
        </div>

        <div class="dur-card full">
            <div class="dur-title">Detalle por temporada</div>
            <div class="temp-lista">${tarjetasTemporadas}</div>
        </div>

        <div class="dur-card full">
            <div class="dur-title">Duración del episodio vs otras obras</div>
            <div style="margin-bottom:16px">
                <div class="comp-header">
                    <span class="comp-name" style="color:var(--accent);font-weight:700">${serie.name} (ep.)</span>
                    <span class="comp-mins" style="color:var(--accent)">${epDur || '—'} min</span>
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

        btn.disabled          = true;
        btnText.style.display = 'none';
        spinner.style.display = 'inline';

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
                const item   = resultado.results[i];
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
