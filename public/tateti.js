const estado = document.getElementById("estado");
const partida = document.getElementById("partida");
const ganadasX = document.getElementById("ganadasX");
const ganadasO = document.getElementById("ganadasO");
const botones = Array.from(document.querySelectorAll("button[id^='boton']"));
const juegaPC = document.getElementById("juegaPC");

let Partida = 1;
let Jugada = 1;
let ganador = "";
let Jugador = "X";

const jugadores = [
  { nombre: "X", victorias: 0, jugadas: [] },
  { nombre: "O", victorias: 0, jugadas: [] },
];

const ganadoras = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [1, 5, 9],
  [3, 5, 7],
];

const cambiarJugador = () => (Jugador = Jugador === "X" ? "O" : "X");

const declararGanador = (ganador) => {
  estado.innerHTML = `GANÓ ${ganador}`;
  estado.classList.add("ganador");
  setTimeout(() => estado.classList.remove("ganador"), 2500);

  if (ganador == jugadores[0].nombre) {
    jugadores[0].victorias = jugadores[0].victorias + 1;
  } else if (ganador == jugadores[1].nombre) {
    jugadores[1].victorias = jugadores[1].victorias + 1;
  }
  // Actualizo puntajes
  ganadasX.innerHTML = jugadores[0].victorias;
  ganadasO.innerHTML = jugadores[1].victorias;
  ganadasX.innerHTML = jugadores[0].victorias;
  ganadasO.innerHTML = jugadores[1].victorias;

  const ganadora = ganadoras.find((combinacion) =>
    combinacion.every((pos) =>
      jugadores
        .find((jugador) => jugador.nombre === ganador)
        .jugadas.includes(pos)
    )
  );

  for (const pos of ganadora) {
    document.getElementById(`boton${pos}`).classList.add("btn_ganador");
    setTimeout(
      () =>
        document.getElementById(`boton${pos}`).classList.remove("btn_ganador"),
      2000
    );
  }
};

const declararEmpate = () => {
  estado.innerHTML = `¡ESTO ES UN EMPATE!`;
};

const verificaGanador = () => {
  for (const jugador of jugadores) {
    if (
      ganadoras.some((combinacion) =>
        combinacion.every((pos) => jugador.jugadas.includes(pos))
      )
    ) {
      ganador = jugador.nombre;
      declararGanador(ganador);
      return;
    }
  }

  if (Jugada === 9 && ganador === "") {
    declararEmpate();
  }
};

const juega = (id) => {
  document.getElementById(
    "jugadas"
  ).innerHTML = `Jugó ${Jugador} en boton ${id} `;
  const botonJugado = document.getElementById(`boton${id}`);
  botonJugado.disabled = true;
  botonJugado.innerHTML = `${Jugador}`;

  const jugadorActual = jugadores.find((jugador) => jugador.nombre === Jugador);
  jugadorActual.jugadas.push(id);

  armarJugada(Jugador, id); // Actualiza la jugada en la variable jugadaAPI

  cambiarJugador();
  estado.innerHTML = `Ahora juega ${Jugador}`;
  verificaGanador();
  Jugada++;

  if (juegaPC.checked && Jugador === "O") {
    sugerirJugada();
  }
};

const resetear = () => {
  Partida++;
  jugadores.forEach((jugador) => (jugador.jugadas = []));
  Jugador = "X";
  ganador = "";
  jugadaAPI = "---------";
  Jugada = 1;

  botones.forEach((boton) => {
    boton.innerHTML = "";
    boton.disabled = false;
    boton.classList.remove("ganador");
  });

  estado.innerHTML = `Comienza la partida ${Partida}`;
  partida.innerHTML = `${Partida}`;
  document.getElementById("jugadas").innerHTML = "";
};

const cargarBotones = () => {
  botones.forEach((boton) =>
    boton.addEventListener("click", () => juega(parseInt(boton.id.slice(-1))))
  );
  document.getElementById("botonReset").addEventListener("click", resetear);
};

/* API */
let jugadaAPI = "---------";
const armarJugada = (jugador, jugada) => {
  console.log(`Jugador: ${jugador}`);
  console.log(`Jugada: ${jugada}`);
  String.prototype.replaceAt = function (index, replacement) {
    if (index >= this.length) {
      return this.valueOf();
    }
    return this.substring(0, index) + replacement + this.substring(index + 1);
  };

  jugadaAPI = jugadaAPI.replaceAt(jugada - 1, jugador);
  console.log(jugadaAPI);
};

const fetchRespuestas = async () => {
  try {
    const response = await fetch(`/api/tictactoe/${jugadaAPI}/${Jugador}`);
    const { index } = await response.json();
    console.log(`Jugada actual: ${jugadaAPI}`);
    console.log(`Jugador actual: ${Jugador}`);
    console.log(`Jugada sugerida: ${index}`);
    return index;
  } catch (err) {
    console.error(err);
  }
};

const sugerirJugada = async () => {
  const jugadaSugerida = await fetchRespuestas();
  if (jugadaSugerida !== undefined) {
    document.getElementById(`boton${jugadaSugerida + 1}`).click();
  }
};

const start = async () => {
  cargarBotones();
  partida.innerHTML = `${Partida}`;
  respuestas = await fetchRespuestas();
};

window.onload = start;
