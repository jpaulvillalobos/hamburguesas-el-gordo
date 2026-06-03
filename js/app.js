/**
 * LOBOLINK SERVICES - Arquitectura Modular Asíncrona (Múltiples JSONs)
 * Cliente: Hamburguesas Donde El Gordo (Suba)
 */

// Elementos del DOM
const elLocalName = document.getElementById('local-name');
const elLocalAddress = document.getElementById('local-address');
const elLocalHours = document.getElementById('local-hours');
const elLocalDeliveryTime = document.getElementById('local-delivery-time');
const elLocalPromo = document.getElementById('local-promo');
const elCategoriesContainer = document.getElementById('categories-container');
const elMenuContainer = document.getElementById('menu-container');
const elReviewsContainer = document.getElementById('reviews-container');
const elWhatsappBtn = document.getElementById('whatsapp-btn');

// Variable global para almacenar el menú en memoria para los filtros interactivos
let menuProductos = [];

// Inicializador de la Aplicación
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        // Ejecutamos ambas peticiones fetch en paralelo para máxima velocidad
        const [respuestaMenu, respuestaResenas] = await Promise.all([
            fetch('data/menu.json'),
            fetch('data/resenas.json') // Corregido el typo '.jason' a '.json'
        ]);
        
        // Validación de respuestas HTTP
        if (!respuestaMenu.ok) throw new Error(`Error al cargar menú: ${respuestaMenu.status}`);
        if (!respuestaResenas.ok) throw new Error(`Error al cargar reseñas: ${respuestaResenas.status}`);
        
        // Conversión a objetos JavaScript
        const dataMenu = await respuestaMenu.json();
        const dataResenas = await respuestaResenas.json();
        
        // Guardamos los productos en la variable global
        menuProductos = dataMenu.menu;

        // Renderizar componentes usando los datos de sus respectivos archivos
        renderInfoGlobal(dataMenu.infoGlobal);
        renderCategorias(dataMenu.menu);
        renderMenu(dataMenu.menu); // Carga inicial completa del menú
        
        // Extraemos las reseñas (soporta si el JSON viene como { "reseñas": [...] } o directo como un Array)
        const lasResenas = dataResenas.reseñas || dataResenas.resenas || (Array.isArray(dataResenas) ? dataResenas : []);
        renderReseñas(lasResenas);
        
        setupWhatsApp(dataMenu.infoGlobal);

    } catch (error) {
        console.error("Error cargando los módulos de datos estructurados:", error);
        elMenuContainer.innerHTML = `
            <div class="loading-spinner">
                ¡Ay caramba! Tuvimos problemas para conectar con la base de datos de Springfield. Reintenta más tarde. 🍩
            </div>`;
    }
}

// ==========================================
// FUNCIONES DE RENDERIZADO DINÁMICO
// ==========================================

function renderInfoGlobal(info) {
    if (!info) return;
    elLocalName.textContent = `${info.nombre} - ${info.sede}`;
    elLocalAddress.textContent = info.direccion;
    elLocalHours.textContent = info.horarios;
    elLocalDeliveryTime.textContent = info.tiempoEntrega;
    elLocalPromo.textContent = info.promoDestacada;
}

function renderCategorias(menu) {
    if (!menu) return;
    // Extraer categorías únicas usando un Set
    const categorias = ['Todos', ...new Set(menu.map(item => item.categoria))];
    
    elCategoriesContainer.innerHTML = '';
    
    categorias.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.classList.add('category-btn');
        if(index === 0) btn.classList.add('active'); // "Todos" activo por defecto
        btn.textContent = cat;
        
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filtrarMenu(cat);
        });
        
        elCategoriesContainer.appendChild(btn);
    });
}

function renderMenu(productos) {
    elMenuContainer.innerHTML = '';
    
    if(!productos || productos.length === 0) {
        elMenuContainer.innerHTML = `<div class="loading-spinner">No hay productos disponibles temporalmente.</div>`;
        return;
    }

    productos.forEach(prod => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('menu-card');
        
        // Formateo a pesos colombianos nativos ($ XX.XXX)
        const precioFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(prod.precio);
        
        let precioHTML = `<span class="price">${precioFormateado}</span>`;
        let badgeDescuentoHTML = '';

        // Lógica para aplicar etiquetas de descuento visual si existen en el JSON
        if (prod.descuento && prod.precioOriginal) {
            const precioOriginalFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(prod.precioOriginal);
            precioHTML = `
                <div class="price-container">
                    <span class="discount-price">${precioOriginalFormateado}</span>
                    <span class="price">${precioFormateado}</span>
                </div>
            `;
            badgeDescuentoHTML = `<div class="discount-badge">-${prod.descuento}</div>`;
        }

        tarjeta.innerHTML = `
            ${badgeDescuentoHTML}
            <img src="${prod.imagen || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500'}" alt="${prod.nombre}" class="menu-card-img" loading="lazy">
            <div class="menu-card-body">
                <h3>${prod.nombre}</h3>
                <p>${prod.descripcion}</p>
            </div>
            <div class="menu-card-footer">
                ${precioHTML}
            </div>
        `;
        
        elMenuContainer.appendChild(tarjeta);
    });
}

function renderReseñas(reseñas) {
    elReviewsContainer.innerHTML = '';
    
    if(!reseñas || reseñas.length === 0) {
        elReviewsContainer.innerHTML = `<div class="loading-spinner">No hay reseñas disponibles.</div>`;
        return;
    }
    
    reseñas.forEach(res => {
        const tarjetaReseña = document.createElement('div');
        tarjetaReseña.classList.add('review-card');
        
        let estrellasHTML = '';
        for (let i = 0; i < res.estrellas; i++) {
            estrellasHTML += `<i class="fas fa-star"></i>`;
        }
        
        tarjetaReseña.innerHTML = `
            <div class="stars">${estrellasHTML}</div>
            <p>"${res.comentario}"</p>
            <h4>- ${res.autor}</h4>
        `;
        
        elReviewsContainer.appendChild(tarjetaReseña);
    });
}

function filtrarMenu(categoria) {
    if (categoria === 'Todos') {
        renderMenu(menuProductos);
    } else {
        const productosFiltrados = menuProductos.filter(prod => prod.categoria === categoria);
        renderMenu(productosFiltrados);
    }
}

function setupWhatsApp(info) {
    if (!info) return;
    const mensaje = `Hola ${info.nombre} Sede ${info.sede}! 👋 Vengo de su Menú Digital y me gustaría realizar un pedido. 🍔🍕`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    elWhatsappBtn.href = `https://wa.me/${info.whatsappPedido}?text=${mensajeCodificado}`;
    elWhatsappBtn.style.display = 'flex';
}
