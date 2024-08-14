const pokeApi = {};

function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name;

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    const [type] = types;

    pokemon.types = types;
    pokemon.type = type;
    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

    pokemon.hp = pokeDetail.stats.find(stat => stat.stat.name === 'hp').base_stat;
    pokemon.attack = pokeDetail.stats.find(stat => stat.stat.name === 'attack').base_stat;
    pokemon.defense = pokeDetail.stats.find(stat => stat.stat.name === 'defense').base_stat;
    pokemon.spAttack = pokeDetail.stats.find(stat => stat.stat.name === 'special-attack').base_stat;
    pokemon.spDefense = pokeDetail.stats.find(stat => stat.stat.name === 'special-defense').base_stat;
    pokemon.speed = pokeDetail.stats.find(stat => stat.stat.name === 'speed').base_stat;
    pokemon.total = pokemon.hp + pokemon.attack + pokemon.defense + pokemon.spAttack + pokemon.spDefense + pokemon.speed;

    return pokemon;
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon);
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails);
}

const pokemonOl = document.getElementById('pokemon-list');
const botaoCarregarMais = document.getElementById('carregarMais');
const limit = 5;
let offset = 0;

function carregarPokemons(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        pokemonOl.innerHTML += pokemons.map((pokemon) => `
            <li class="pokemon ${pokemon.type}" onclick='handlePokemonClick(${JSON.stringify(pokemon).replace(/'/g, "\\'")})'>
                <span class="number">#${pokemon.number}</span>
                <span class="name">${pokemon.name}</span>

                <div class="detail">
                    <ol class="types">
                        ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                    </ol>
                    <img src="${pokemon.photo}" alt="${pokemon.name}">
                </div>
            </li>
        `).join('');
    });
}

function handlePokemonClick(pokemon) {
    pokeApi.getPokemonDetail({ url: `https://pokeapi.co/api/v2/pokemon/${pokemon.number}/` })
        .then(pokemonDetail => {
            abrirModal(pokemonDetail);
        });
}

const modal = document.getElementById('modal-total');

function fecharModal() {
    const modal = document.getElementById('modal-total');
    const modalDiv = modal.querySelector('.modal');
    
    // Remove a classe do tipo do Pokémon da div.modal
    const types = ['grass', 'poison', 'fire', 'water', 'electric', 'bug', 'normal']; // Adicione todos os tipos que você usa
    types.forEach(type => modalDiv.classList.remove(type));
    
    modal.classList.remove('visivel');
}

function abrirModal(pokemon) {
    const modal = document.getElementById('modal-total');
    const modalContent = modal.querySelector('.modal-content');

    // Atualize o conteúdo do modal com as informações do Pokémon
    modalContent.querySelector('.nome-perfil').textContent = pokemon.name;
    modalContent.querySelector('.numero-perfil').textContent = `#${pokemon.number}`;
    modalContent.querySelector('.imagem-pokemon img').src = pokemon.photo;

    const atributos = modal.querySelectorAll('.atributos');
    atributos.forEach((atributo, index) => {
        const meter = atributo.querySelector('meter');
        switch (index) {
            case 0:
                atributo.querySelector('.valor-atributo').textContent = pokemon.hp;
                meter.value = pokemon.hp;
                break;
            case 1:
                atributo.querySelector('.valor-atributo').textContent = pokemon.attack;
                meter.value = pokemon.attack;
                break;
            case 2:
                atributo.querySelector('.valor-atributo').textContent = pokemon.defense;
                meter.value = pokemon.defense;
                break;
            case 3:
                atributo.querySelector('.valor-atributo').textContent = pokemon.spAttack;
                meter.value = pokemon.spAttack;
                break;
            case 4:
                atributo.querySelector('.valor-atributo').textContent = pokemon.spDefense;
                meter.value = pokemon.spDefense;
                break;
            case 5:
                atributo.querySelector('.valor-atributo').textContent = pokemon.speed;
                meter.value = pokemon.speed;
                break;
            case 6:
                atributo.querySelector('.valor-atributo').textContent = pokemon.total;
                meter.value = pokemon.total;
                break;
        }
    });

    // Adicionar a classe do tipo do Pokémon à div.modal
    const modalDiv = modal.querySelector('.modal');
    modalDiv.classList.add(pokemon.type);

    modal.classList.add('visivel');
}


// Fechar modal clicando fora do card
modal.addEventListener('click', function (event) {
    if (event.target === modal) {
        fecharModal();
    }
});

// Fechar modal com a tecla Esc
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        fecharModal();
    }
});

// Animação de pulo 
const imagem = document.getElementById('pular');

imagem.addEventListener('click', () => {
    imagem.classList.add('pular');

    // Remove a classe após a animação terminar para permitir a repetição ao clicar novamente
    setTimeout(() => {
        imagem.classList.remove('pular');
    }, 500);
});

document.addEventListener('DOMContentLoaded', (event) => {
    const likeButton = document.getElementById('botao-favoritar');

    likeButton.addEventListener('click', () => {
        likeButton.classList.toggle('favoritado');
    });
});

carregarPokemons(offset, limit);

botaoCarregarMais.addEventListener('click', () => {
    offset += limit;
    carregarPokemons(offset, limit);
});
