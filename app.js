// ==================== CÓDIGO ORIGINAL DEL CARRITO ====================
const cartBtn = document.getElementById('cart-btn');
const cartPanel = document.getElementById('cart-panel');
const closeCartBtn = document.getElementById('close-cart');
const addToCartBtns = document.querySelectorAll('.add-to-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');

let cart = [];

// ==================== FUNCIONES DE AYUDA ====================
function saveCart() {
  localStorage.setItem('mitienda_cart', JSON.stringify(cart));
}
function loadCart() {
  const savedCart = localStorage.getItem('mitienda_cart');
  if(savedCart) cart = JSON.parse(savedCart);
}
function showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'cart-notification';
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(()=> notif.remove(), 1500);
}

// ==================== INPUTS DE CANTIDAD CON UNIDAD ====================
addToCartBtns.forEach(btn=>{
  const priceText = btn.parentElement.querySelector(".price").textContent.toLowerCase();
  let unidad = "unidad(es)";
  if(priceText.includes("/ kg")) unidad = "kg";
  else if(priceText.includes("/ bandeja")) unidad = "bandeja(s)";
  else if(priceText.includes("/ 1l")) unidad = "litro(s)";

  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "5px";

  const input = document.createElement("input");
  input.type = "number";
  input.min = "0.1";
  input.step = "0.1";
  input.value = "1";
  input.className = "qty-input";
  input.style.width = "60px";
  input.style.marginRight = "5px";

  const label = document.createElement("span");
  label.textContent = unidad;

  wrapper.appendChild(input);
  wrapper.appendChild(label);
  btn.parentElement.insertBefore(wrapper, btn);
});

// ==================== ABRIR/CERRAR CARRITO ====================
cartBtn.addEventListener('click', ()=> cartPanel.classList.toggle('open'));
closeCartBtn.addEventListener('click', ()=> cartPanel.classList.remove('open'));

// ==================== RENDERIZAR CARRITO ====================
function renderCart(){
  cartItemsEl.innerHTML = '';
  let total = 0;
  if(cart.length === 0){
    cartItemsEl.innerHTML = '<p>Carrito vacío</p>';
  } else {
    cart.forEach((item, index)=>{
      total += item.price * item.quantity;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div>
          <strong>${item.name}</strong><br>
          Cantidad: ${item.quantity} ${item.unit}<br>
          Subtotal: $${(item.price * item.quantity).toLocaleString()}
          <button class="remove-btn" data-index="${index}">Eliminar</button>
        </div>
      `;
      cartItemsEl.appendChild(div);
    });

    document.querySelectorAll('.remove-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const idx = e.target.dataset.index;
        cart.splice(idx,1);
        saveCart();
        renderCart();
        showNotification("Producto eliminado 🗑️");
      });
    });
  }

  cartTotal.textContent = `$${total.toLocaleString()}`;
  cartCount.textContent = cart.length;
  saveCart();
}

// ==================== FUNCION CENTRAL PARA AGREGAR PRODUCTO ====================
function addToCartHandler(e) {
    const btn = e.currentTarget;
    const product = btn.parentElement;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);
    const img = product.querySelector('img').src;
    const qtyInput = product.querySelector('.qty-input');
    const quantity = parseFloat(qtyInput.value);
    const unit = product.querySelector("span").textContent;

    if(isNaN(quantity) || quantity <= 0){
        alert("Por favor ingresa una cantidad válida");
        return;
    }

    // Animación fly to cart
    const productImg = product.querySelector('img');
    const flyingImg = productImg.cloneNode(true);
    flyingImg.style.position = 'absolute';
    const rect = productImg.getBoundingClientRect();
    flyingImg.style.top = rect.top + "px";
    flyingImg.style.left = rect.left + "px";
    flyingImg.style.width = rect.width + "px";
    flyingImg.style.height = rect.height + "px";
    flyingImg.style.transition = 'all 0.8s ease-in-out';
    flyingImg.style.zIndex = 1000;
    document.body.appendChild(flyingImg);

    const cartRect = cartBtn.getBoundingClientRect();
    setTimeout(()=>{
        flyingImg.style.top = cartRect.top + "px";
        flyingImg.style.left = cartRect.left + "px";
        flyingImg.style.width = "0px";
        flyingImg.style.height = "0px";
        flyingImg.style.opacity = 0.5;
    }, 50);
    flyingImg.addEventListener('transitionend', ()=> flyingImg.remove());

    cart.push({ name, price, img, quantity, unit });
    renderCart();
    cartPanel.classList.add('open');
    showNotification(`✅ ${name} agregado al carrito`);
}

// ==================== ASIGNAR EVENTO A TODOS LOS BOTONES ====================
document.querySelectorAll('.add-to-cart:not([data-bound])').forEach(btn => {
    btn.dataset.bound = "true"; // marcar como ligado
    btn.addEventListener('click', addToCartHandler);
});

// ==================== FINALIZAR COMPRA ====================
checkoutBtn.addEventListener('click', ()=>{
  if(cart.length === 0){
    alert('El carrito está vacío 😢');
    return;
  }
  let message = 'Resumen de tu compra:\n';
  cart.forEach(item=> 
    message += `${item.name} x ${item.quantity} ${item.unit} = $${(item.price * item.quantity).toLocaleString()}\n`
  );
  message += `\nTotal: $${cart.reduce((sum,item)=>sum+(item.price*item.quantity),0).toLocaleString()}`;
  alert(message + '\n\nCompra simulada. ¡Gracias por tu compra! 🎉');
  cart = [];
  renderCart();
});

// ==================== CARGAR CARRITO AL INICIO ====================
window.addEventListener('load', ()=>{
  loadCart();
  renderCart();
});

// ==================== MODO OSCURO FUNCIONAL ====================
const darkModeToggle = document.getElementById('dark-mode-toggle');
if(darkModeToggle){
  if(localStorage.getItem('mitienda_dark') === 'true'){
    document.body.classList.add('dark');
    darkModeToggle.textContent = "☀️";
  }
  darkModeToggle.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    darkModeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem('mitienda_dark', isDark);
  });
}

// ==================== POPUP DE BIENVENIDA ====================
const popup = document.getElementById('welcome-popup');
const closePopupBtn = document.getElementById('close-popup');

if(popup && closePopupBtn){
  function showPopup() {
    popup.classList.add('show');
  }
  window.addEventListener('load', ()=> { setTimeout(showPopup, 500); });
  closePopupBtn.addEventListener('click', ()=> { popup.classList.remove('show'); });
}

// ==================== NOTIFICACIONES ====================
const style = document.createElement('style');
style.textContent = `
.cart-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  z-index: 9999;
  opacity: 0.9;
  transition: all 0.3s ease;
}
`;
document.head.appendChild(style);

// ==================== RECETAS: AGREGAR BOTÓN DINÁMICO ====================
document.querySelectorAll('#recetas .product').forEach(product => {
    if(!product.querySelector('.add-to-cart')){
        const name = product.querySelector('h3').textContent;
        const price = 5000;
        const btn = document.createElement('button');
        btn.className = 'add-to-cart';
        btn.dataset.name = name;
        btn.dataset.price = price;
        btn.textContent = 'Agregar';
        product.appendChild(btn);

        let unidad = "unidad(es)";
        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "5px";
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0.1";
        input.step = "0.1";
        input.value = "1";
        input.className = "qty-input";
        input.style.width = "60px";
        input.style.marginRight = "5px";
        const label = document.createElement("span");
        label.textContent = unidad;
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        product.insertBefore(wrapper, btn);
    }
});

const addToCartBtnsNew = document.querySelectorAll('.add-to-cart:not([data-bound])');
addToCartBtnsNew.forEach(btn => {
    btn.dataset.bound = "true";
    btn.addEventListener('click', addToCartHandler);
});

// ==================== MEJORAS ADICIONALES ====================

// 1️⃣ Añadir descripciones automáticas a los productos
document.querySelectorAll('.product').forEach(product => {
    if(!product.querySelector('.auto-desc')){
        const desc = document.createElement('p');
        desc.className = 'auto-desc';
        desc.textContent = "Producto fresco y de alta calidad.";
        desc.style.fontSize = "0.9rem";
        desc.style.color = "#555";
        product.appendChild(desc);
    }
});

// 2️⃣ Validación básica del formulario de contacto
const contactForm = document.getElementById('contact-form');
if(contactForm){
    contactForm.addEventListener('submit', function(e){
        const emailInput = contactForm.querySelector('input[type="email"]');
        const nameInput = contactForm.querySelector('input[name="name"]');
        const messageInput = contactForm.querySelector('textarea[name="message"]');

        if(!nameInput.value.trim()){
            alert("Por favor ingresa tu nombre.");
            e.preventDefault();
            return;
        }
        if(!emailInput.value.includes("@")){
            alert("Por favor ingresa un correo válido.");
            e.preventDefault();
            return;
        }
        if(!messageInput.value.trim()){
            alert("Por favor ingresa tu mensaje.");
            e.preventDefault();
            return;
        }
    });
}
