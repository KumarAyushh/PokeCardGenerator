//selecting elements of html and storing them in variables using DOM methods
const cardSection = document.querySelector('.card-section');
const button = document.getElementById('generateButton'); // Fix this line
const countInput = document.getElementById('cardCount'); // Changed from 'card-count' to 'cardCount'
const categorySelect = document.getElementById('category');
const numberInput = document.getElementById('cardCount');

// Prevent mouse wheel from changing the number
numberInput.addEventListener('wheel', function(e) {
    e.preventDefault();
});

// Prevent mousedown from auto-repeating
numberInput.addEventListener('mousedown', function(e) {
    if (e.target.matches('::-webkit-inner-spin-button, ::-webkit-outer-spin-button')) {
        e.preventDefault();
    }
});

//fetching pokemon data from the API
//using async/await to handle asynchronous operations
async function fetchPokemon(id) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) throw new Error('Pokemon not found');
      return await res.json();
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      return null;
    }
  }

  // Function to create a card element for each Pokemon
//using template literals to create HTML structure for the card
function createCard(pokemon) {
  const card = document.createElement('div');
  card.classList.add('card');

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <h3>${pokemon.name[0].toUpperCase() + pokemon.name.slice(1)}</h3>
    <p>ID: ${pokemon.id}</p>
    <p>Type: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
  `;

  cardSection.appendChild(card);
  updateNavigation(); // Update navigation after adding a card
}

// Event listener for the button click
//using async/await to handle asynchronous operations
button.addEventListener('click', async () => {
    try {
        button.disabled = true; // Disable button while loading
        const count = parseInt(countInput.value);
        const category = categorySelect.value.toLowerCase();

        if (isNaN(count) || count <= 0 || count > 50) {
            alert('Please enter a valid number between 1 and 50');
            return;
        }

        cardSection.innerHTML = '';
        let fetched = 0;

        while (fetched < count) {
            const id = Math.floor(Math.random() * 151) + 1;
            const data = await fetchPokemon(id);
            
            if (!data) continue;

            const types = data.types.map(t => t.type.name.toLowerCase());
            
            if (types.includes(category)) {
                createCard(data);
                fetched++;
            }
        }

        // Center the scroll position after all cards are generated
        const scrollOffset = (cardSection.scrollWidth - cardSection.clientWidth) / 2;
        cardSection.scrollTo({
            left: scrollOffset,
            behavior: 'smooth'
        });
        
        updateNavigation();
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong!');
    } finally {
        button.disabled = false;
    }
});

// Navigation buttons
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// Update navigation visibility and state
function updateNavigation() {
    const hasOverflow = cardSection.scrollWidth > cardSection.clientWidth;
    
    if (hasOverflow) {
        const maxScroll = cardSection.scrollWidth - cardSection.clientWidth;
        
        // Show both buttons if there's content to scroll
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        
        // Fade buttons at scroll limits
        prevBtn.classList.toggle('faded', cardSection.scrollLeft <= 0);
        nextBtn.classList.toggle('faded', cardSection.scrollLeft >= maxScroll);
    } else {
        // Hide both buttons if no overflow
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

// Add resize observer to handle responsive layout changes
const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(updateNavigation);
});

resizeObserver.observe(cardSection);

// Update scroll amount based on screen size
function getScrollAmount() {
    const cardWidth = document.querySelector('.card')?.offsetWidth || 160;
    return cardWidth + 32; // card width + gap
}

// Update navigation button click handlers
nextBtn.addEventListener('click', () => {
    const scrollAmount = getScrollAmount();
    const maxScroll = cardSection.scrollWidth - cardSection.clientWidth;
    const newScrollPosition = Math.min(cardSection.scrollLeft + scrollAmount, maxScroll);
    
    cardSection.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
    });
    updateNavigation();
});

prevBtn.addEventListener('click', () => {
    const scrollAmount = getScrollAmount();
    const newScrollPosition = Math.max(cardSection.scrollLeft - scrollAmount, 0);
    
    cardSection.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
    });
    updateNavigation();
});

// Update navigation on scroll
cardSection.addEventListener('scroll', () => {
    requestAnimationFrame(updateNavigation);
});

// Initial navigation state
updateNavigation();

