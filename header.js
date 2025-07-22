class PetLinkHeader extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .navbar-container {
          width: 100%;
          height: 130px;
          background-color: #F08224;
          display: flex;
          align-items: center;
          padding-left: 50px;
          font-family: 'Mulish', sans-serif;
        }

        .logo-container {
          display: flex;
        }

        .logo-circle {
          width: 90px;
          height: 90px;
          background-color: #FFF9E9;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .logo-svg {
          width: 110px;
          height: 110px;
          position: absolute;
          top: -10px;
          left: -0.4rem;
        }

        .logo_texto {
          color: white;
          font-size: 25px;
          font-weight: bold;
          margin-left: 21px;
        }

        .navbar {
          display: flex;
          align-items: center;
          margin-left: auto;
          margin-right: 50px;
        }

        .navbar a {
          color: white;
          text-decoration: none;
          font-size: 20px;
          font-weight: 500;
          margin-right: 31px;
          transition: all 0.2s ease;
        }

        .navbar a.active {
          text-decoration: underline;
          font-weight: 700;
        }

        .navbar a:last-child {
          margin-right: 0;
        }
      </style>

      <header>
        <div class="navbar-container">
          <div class="logo-container">
            <div class="logo-circle">
              <img class="logo-svg" src="/logos/PetLink Logo.svg" alt="PetLink Logo">
            </div>
            <div class="logo_texto">
              <p>PetLink</p>
            </div>
          </div>
          <nav class="navbar">
            <a href="/index.html">Inicio</a>
            <a href="/pages/nosotros.html">Nosotros</a>
            <a href="/pages/adoptar.html">Adoptar</a>
            <a href="/pages/dar_en_adopcion.html">Dar en adopción</a>
            <a href="/pages/antes-de-adoptar.html">Antes de adoptar</a>
            <a href="/pages/perfil.html">Perfil</a>
            <a href="/pages/iniciosesion.html">Iniciar Sesión</a>
          </nav>
        </div>
      </header>
    `;

    
    const currentPath = window.location.pathname;


    const links = shadow.querySelectorAll('.navbar a');
    links.forEach(link => {
      const href = link.getAttribute('href');

 
      if (
        href === currentPath ||
        (href.endsWith('/index.html') && currentPath === '/')
      ) {
        link.classList.add('active');
      }

      link.addEventListener('click', () => {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }
}

customElements.define('petlink-header', PetLinkHeader);