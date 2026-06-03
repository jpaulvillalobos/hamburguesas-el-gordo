/**
 * LOBOLINK SERVICES - Módulo de Galería Transicional Automática
 * Cambios de imagen cada 5 segundos
 */

// Array de imágenes (Maqueta simulando la respuesta de un JSON)
const IMAGENES_GALERIA = [
    { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800", alt: "Experiencia en el local" },
    { url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800", alt: "Nuestras burgers en Instagram" },
    { url: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800", alt: "Clientes felices comiendo" },
    { url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800", alt: "Ambiente temático Simpson" }
];

let indiceActual = 0;
let intervaloGaleria;

document.addEventListener('DOMContentLoaded', () => {
    inicializarGaleria(IMAGENES_GALERIA);
});

function inicializarGaleria(imagenes) {
    const contenedorSlider = document.getElementById('gallery-container');
    const contenedorDots = document.getElementById('gallery-dots');
    
    if (!contenedorSlider || imagenes.length === 0) return;
    
    // Limpiar el cargador del HTML
    contenedorSlider.innerHTML = '';
    contenedorDots.innerHTML = '';

    // 1. Generar dinámicamente las imágenes y los puntitos
    imagenes.forEach((imgData, index) => {
        // Crear diapositiva
        const slide = document.createElement('div');
        slide.classList.add('gallery-slide');
        if (index === 0) slide.classList.add('active'); // La primera inicia visible

        const img = document.createElement('img');
        img.src = imgData.url;
        img.alt = imgData.alt;
        img.loading = "lazy"; // Optimización de rendimiento de carga

        slide.appendChild(img);
        contenedorSlider.appendChild(slide);

        // Crear puntito indicador
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        
        // Permitir que el usuario cambie de imagen al hacer clic en el puntito
        dot.addEventListener('click', () => {
            irAImagen(index);
            reiniciarTemporizador();
        });

        contenedorDots.appendChild(dot);
    });

    // 2. Iniciar el temporizador automático de 5 segundos (5000 ms)
    iniciarTemporizador();
}

function cambiarImagen() {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.dot');
    
    if(slides.length === 0) return;

    // Remover estado activo de la imagen y puntito actual
    slides[indiceActual].classList.remove('active');
    dots[indiceActual].classList.remove('active');

    // Calcular el siguiente índice (vuelve a cero si llega al final)
    indiceActual = (indiceActual + 1) % slides.length;

    // Añadir estado activo a la nueva imagen y puntito
    slides[indiceActual].classList.add('active');
    dots[indiceActual].classList.add('active');
}

function irAImagen(nuevoIndice) {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.dot');

    slides[indiceActual].classList.remove('active');
    dots[indiceActual].classList.remove('active');

    indiceActual = nuevoIndice;

    slides[indiceActual].classList.add('active');
    dots[indiceActual].classList.add('active');
}

function iniciarTemporizador() {
    intervaloGaleria = setInterval(cambiarImagen, 5000);
}

function reiniciarTemporizador() {
    clearInterval(intervaloGaleria);
    iniciarTemporizador();
}