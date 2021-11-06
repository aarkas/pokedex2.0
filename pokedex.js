
const POKEMON_GRID = document.querySelector('#pokemon-grid');
const DETAILS = document.querySelector('#details');
const POKEDEX_REGION = document.querySelector('#current-pokedex');


const NATIONAL = 1;
const KANTO = 2;
const JOHTO = 3;
const HOENN = 4;
const SINNOH = 5;

let pokemonArray = [];

let pokedexUrl = 'https://pokeapi.co/api/v2/pokedex/' + KANTO;

fetch(pokedexUrl)
  .then(x => x.json())
  .then(x => {
    // Get name of Pokedex to display in header
    POKEDEX_REGION.textContent = capitalizeFirstLetter(x.name);

    // Fetch all Pokemon from Pokedex and display on page
    x.pokemon_entries.forEach(function(obj) {
      let pokemonURL = "";
      pokemonURL = 'https://pokeapi.co/api/v2/pokemon/' + obj.entry_number;
      
      fetch(pokemonURL)
        .then(x => x.json())
        .then(x => {

          // Display Pokemon on the page
          pokemonArray.push(x);
          insertPokemonCard(x.name, x.id, x.sprites.front_default);

        })
        .catch(err => {
          console.log(err);
        })
    })
  })
  .catch(err => {
    console.log(err || "this is an error");
  });


function insertPokemonCard(name, pokemonId, imgUrl) {

  // Get parent container
  const parent = POKEMON_GRID;

  // Create div container for Pokemon
  const pokemon = document.createElement('div');
  pokemon.className = 'pokemon'
  pokemon.id = pokemonId;

  // Create img element
  const pkImg = document.createElement('img');
  pkImg.src = imgUrl;
  
  // Add Pokemon name underneath image
  const pokeName = document.createElement('h2');
  pokeName.textContent = capitalizeFirstLetter(name);

  // Put div together
  pokemon.appendChild(pkImg);
  pokemon.appendChild(pokeName);

  // Attach onclick event
  pokemon.addEventListener('click', function() {
    window.scrollTo(0, 0);
    displayPokemonInfo(this.id);
  });

  // Append card to parent div
  parent.appendChild(pokemon);
}


function displayPokemonInfo(id) {

  // Get DOM elements
  const POKEMON_NAME = document.querySelector('#pk-name');
  const TYPE_LIST = document.querySelector('#type-list');
  const SPRITE = document.querySelector('#sprite');
  const STATS = document.querySelector('#stat-list');
  const EVOLUTION = document.querySelector('#evolution-list');

  // Clear elements before populating with API data
  POKEMON_NAME.innerHTML = "";
  TYPE_LIST.innerHTML = "";
  SPRITE.innerHTML = "";
  STATS.innerHTML = "";
  EVOLUTION.innerHTML = "";

  // Make API call to get Pokemon info
  let pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/' + id;

  fetch(pokemonUrl)
    .then(x => x.json())
    .then(x => {

      // Name
      POKEMON_NAME.textContent = x.name;

      // Types
      x.types.forEach(function(obj) {
        // Create div
        let type = document.createElement('div');
        let typeName = obj.type.name;
        type.textContent = typeName; 

        // Add class names to style each type div
        type.classList.add('type');
        type.classList.add(typeName); // To apply color to div

        // Append types to parent container
        TYPE_LIST.appendChild(type);
      })

      let img = document.createElement('img');
      img.src = x.sprites.front_default;
      img.alt = x.name;
      SPRITE.appendChild(img);

      // Base Stats
      x.stats.forEach(function(obj) {

        // Create separate <li> elements for grid positioning (two columns)
        let statLabel = document.createElement('li');
        statLabel.textContent = obj.stat.name + ": ";
        STATS.appendChild(statLabel);
        
        let statAttr = document.createElement('li');
        statAttr.textContent = obj.base_stat;
        STATS.appendChild(statAttr);
      })

      // Height
      document.querySelector('#height .attr-value').textContent = x.height / 10 + ' m';

      // Weight
      document.querySelector('#weight .attr-value').textContent = x.weight / 10 + ' kg';

      // Make another API call to get additional info not included in v2/pokemon/{id} endpoint
      const speciesUrl = x.species.url;

      fetch(speciesUrl)
        .then(x => x.json())
        .then(x => {

          // Set category
          document.querySelector('#category .attr-value').textContent = x.genera[2].genus;

          // Need to make separate API call to retrieve the evolution chain of a Pokemon
          const evolutionUrl = x.evolution_chain.url;

          fetch(evolutionUrl)
            .then(x => x.json())
            .then(x => {


              let evoChain = [];
              let evoData = x.chain;

              do {
                let evoDetails = evoData['evolution_details'][0];
                evoChain.push({
                  "species_name": evoData.species.name,
                  "min_level": !evoDetails ? 1 : evoDetails.min_level,
                  "trigger_name": !evoDetails ? null : evoDetails.trigger.name,
                  "item": !evoDetails ? null : evoDetails.item
                });

                evoData = evoData['evolves_to'][0]; 
              } while (!!evoData && evoData.hasOwnProperty('evolves_to'));

              console.log(evoChain);

              evoChain.forEach(function(evo) {

                const evoDiv = document.createElement('div');
                evoDiv.className = 'pokemon';

                const pokemon = pokemonArray.filter(x => x.name === evo.species_name); 
                const evoImg = document.createElement('img');
                evoImg.src = pokemon[0].sprites.front_default; 

                // Get name
                const evoName = document.createElement('h3');
                evoName.textContent = evo.species_name;

                // Append everything
                evoDiv.appendChild(evoImg);
                evoDiv.appendChild(evoName);
                EVOLUTION.appendChild(evoDiv);
              })
            })
            .catch(err => {
              let errorString = "This Pokemon evolves to/from a Pokemon that isn't included in the current Pokedex." // lol
              EVOLUTION.innerHTML = errorString;
              console.log(err);
            })
        })
        .catch(err => {
          console.log(err);
        })


      // Abilities
      let abilitiesStr = [];
      x.abilities.forEach(function(obj) {
        abilitiesStr.push(obj.ability.name);
      })
      document.querySelector('#abilities .attr-value').textContent = abilitiesStr.join(', ');

      // Clear page and display info
      document.querySelector('.grid-wrapper').style.display = 'none';
      DETAILS.style.display = 'grid';

    })
    .catch(err => {
      console.log(err);
    })
}


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function sortById(pokemonArray) {
  pokemonArray.sort(function(a, b) {
    let numA = Number(a.id);
    let numB = Number(b.id);

    if (numA < numB) {
      return -1;
    }
    else {
      return 1;
    }
  })
} 


// Back button
const backButton = document.querySelector("#back-button");

backButton.addEventListener('click', function() {
  document.querySelector("#grid-wrapper").style.display = 'block';
  DETAILS.style.display = 'none';
})