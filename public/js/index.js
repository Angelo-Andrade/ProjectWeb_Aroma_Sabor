// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, push, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsE4YDW5um9jnjmpGz3rkfz5OOh7Cib8Q",
  authDomain: "project2webcoffee.firebaseapp.com",
  databaseURL: "https://project2webcoffee-default-rtdb.firebaseio.com",
  projectId: "project2webcoffee",
  storageBucket: "project2webcoffee.appspot.com",
  messagingSenderId: "651210882294",
  appId: "1:651210882294:web:e9dbefa9489b5ffdc800d7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}

function ready() {
    let emailInput = document.getElementById('emailInput');
    let passwordInput = document.getElementById('passwordInput');
    let displayName = document.getElementById('displayName');
    
    let authEmailPassButton = document.getElementById('authEmailPassButton');
    if (authEmailPassButton) {
        authEmailPassButton.addEventListener('click', function () {
            let emailInput = document.getElementById('emailInput');
            let passwordInput = document.getElementById('passwordInput');
            let displayName = document.getElementById('displayName');

            firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value)
                .then(function (result) {
                    console.log(result);
                    displayName.innerText = 'Bem vindo, ' + emailInput.value;
                    alert('Autenticado ' + emailInput.value);
                    
                    window.location.href = 'index.html';
                    getProducts()
                    .then((allProducts) => {
                        updateProducts(allProducts);
                    })
                    .catch((error) => {
                        console.error('Erro ao carregar produtos:', error);
                    }); 
                    addEventListeners();            
                })
                .catch(function (error) {
                    console.error(error.code);
                    console.error(error.message);
                    alert(error.message);
                });
        });
    }

    
    // Providers
    let authGoogleButton = document.getElementById('authGoogleButton');
    if (authGoogleButton) {
        authGoogleButton.addEventListener('click', function () {
            let provider = new firebase.auth.GoogleAuthProvider();
            firebase
             .auth()
             .signInWithPopup(provider)
             .then(function (result) {
                    console.log(result);
                    let token = result.credential.accessToken;
                    displayName.innerText = 'Bem vindo, ' + result.user.displayName;
                    window.location.href = 'index.html';
                    getProducts()
                    .then((allProducts) => {
                        updateProducts(allProducts);
                    })
                    .catch((error) => {
                        console.error('Erro ao carregar produtos:', error);
                    }); 
                    addEventListeners();
                }).catch(function (error) {
                    console.log(error);
                    alert('Falha na autenticação');
                });
        });
    }
    
    let createUserButton = document.getElementById('createUserButton');
    if(createUserButton) {

        createUserButton.addEventListener('click', function () {
            firebase
                .auth()
                .createUserWithEmailAndPassword(emailInput.value, passwordInput.value)
                .then(function () {
                    alert('Bem vindo ' + emailInput.value);
                })
                .catch(function (error) {
                    console.error(error.code);
                    console.error(error.message);
                    alert('Falha ao cadastrar, verifique o erro no console.')
                });
        });
    }
    
    let logOutButton = document.getElementById('logOutButton');
    if(logOutButton) {
        logOutButton.addEventListener('click', function () {
            firebase
                .auth()
                .signOut()
                .then(function () {
                    displayName.innerText = 'Você não está autenticado';
                    alert('Você se deslogou');
                }, function (error) {
                    console.error(error);
                });
        });
    }
    
    //eventos
    const addItemButton = document.getElementById("add-item");
    if(addItemButton) {
        addItemButton.addEventListener("click", () => {
            const addProductSection = document.querySelector(".add-product-section");
            addProductSection.style.display = "block";
            addProductSection.scrollIntoView({ behavior: 'smooth' }); 
        });
    }

    const removeItem = document.querySelector(".close-button");
    if (removeItem) {
        removeItem.addEventListener("click", (event) => {
            if(confirm("Realmente deseja apagar o produto?")) {

                try {
                    const productTitle = event.target.closest('.product-info').querySelector('.product-title').textContent;
                    if (productTitle) {
                        deleteProduct(productTitle);
                        removeItem.parentElement.parentElement.remove();
                    }
                } catch (err) {
                    alert("Não foi possível apagar o produto!");
                    console.error(err);
                }
            }
        });
    }
    
    const cancelButtons = document.querySelectorAll("#cancel-product-form");
    cancelButtons.forEach(cancelButton => {
        cancelButton.addEventListener("click", () => {
            const oldNameElement = document.querySelector('.old-name');
            let content = oldNameElement.textContent.split(' ');
            content.pop();
            content = content.join(' ');
            content = content.replace(',',' ');
            oldNameElement.textContent = content;
            const gallerySection = document.querySelector(".gallery");
            gallerySection.scrollIntoView({ behavior: 'smooth' });
            document.querySelector(".add-product-section").style.display = "none";
            document.querySelector(".edit-product-section").style.display = "none";
        });
    });    

    const addProductForm = document.getElementById("add-product-form");
    if(addProductForm) {

        addProductForm.addEventListener("submit", function(event) {
            event.preventDefault();
            try {
                const productName = document.getElementById("product-name").value;
                const productDescription = document.getElementById("product-description").value;
                const productPrice = document.getElementById("product-price").value;
                const productImage = document.getElementById("product-image").files[0];
    
                if (productImage) {
                    const reader = new FileReader();
    
                    reader.onload = function(event) {
                        const base64Image = event.target.result;
    
                        const newItem = createProductItem(productName, productDescription, productPrice, base64Image);
                        const gallerySection = document.querySelector(".gallery");
    
                        if (newItem) {
                            gallerySection.appendChild(newItem);
                            document.getElementById("add-product-form").reset();
                            gallerySection.scrollIntoView({ behavior: 'smooth' });
                            addEventListenersToNewElements(newItem);
                        } else {
                            console.error('O novo item não pôde ser criado.');
                        }
    
                        document.querySelector(".add-product-section").style.display = "none";
                        insertProducts(productName, productDescription, productPrice, base64Image);
                    };
    
                    reader.readAsDataURL(productImage);
                } else {
                    console.log('Nenhum arquivo de imagem selecionado.');
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    const editProductButton = document.querySelector("#edit-product-form");
    if(editProductButton) {
        editProductButton.addEventListener("submit", function (event) {
            event.preventDefault();
            try {
                const oldNameElement = document.querySelector('.old-name');
                let oldName;
                let content;
                if (oldNameElement) {
                    content = oldNameElement.textContent.split(' ');
                    oldName = content.pop();
                    content = content.join(' ');
                    content = content.replace(',',' ');
                }
                const newName = editProductButton.querySelector('#product-name').value;
                const description = editProductButton.querySelector('#product-description').value;
                const price = editProductButton.querySelector('#product-price').value;
                const productImage = document.querySelectorAll("#product-image")[1].files[0];

                if (productImage) {
                    const reader = new FileReader();
    
                    reader.onload = function(event) {
                        const base64Image = event.target.result;
                        const gallerySection = document.querySelector(".gallery");
                        document.querySelector(".edit-product-section").style.display = "none";
                        while (document.querySelector(".gallery").firstChild) {
                            document.querySelector(".gallery").removeChild(document.querySelector(".gallery").firstChild);
                        }
                        editProduct(oldName, newName, description, price, base64Image).then(() =>{
                            getProducts().then((allProducts) => {
                                updateProducts(allProducts);
                                gallerySection.scrollIntoView({ behavior: 'smooth' });
                                oldNameElement.textContent = content;
                            }).catch((error) => {
                                console.error(error);
                            }); 
                            addEventListeners();

                        }).catch((error) => {
                            console.error(error);
                        });
                    };
    
                    reader.readAsDataURL(productImage);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    const getReceipt = document.querySelector(".purchase-button");
    if (getReceipt) {
        getReceipt.addEventListener("click", () => {
            finalisePurchase();
        });
    } 

    const sortLabel = document.querySelector("#search-selector");
    if (sortLabel && sortLabel.value !== "default") {
        sortLabel.addEventListener("change", () => {
            sortItems(sortLabel.value);
        });
    }

    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            console.log("pesquisando itens...");
            const searchInput = document.querySelector("#search-bar").value.toLowerCase();
            const searchSelector = document.querySelector("#search-selector").value;
            if (searchInput && searchSelector) {
                searchProducts(searchInput, searchSelector).then((allProducts) => {
                    console.log(allProducts);
                    updateProducts(allProducts);
                }).catch((error) => {
                    alert("Houve um erro ao carregar os produtos solicitados!\nVerifique os dados inseridos e o filtro selecionado.");
                    console.error(error);
                }); 
                addEventListeners();
            }
        });
    }
    
    const restoreButton = document.querySelector('#products-restore');
    if (restoreButton) {
        restoreButton.addEventListener('click', () => {
            getProducts().then((allProducts) => {
                while (document.querySelector(".gallery").firstChild) {
                    document.querySelector(".gallery").removeChild(document.querySelector(".gallery").firstChild);
                }
                updateProducts(allProducts);
            }).catch((error) => {
                console.error(error);
            }); 
            addEventListeners();
        });
    }
    
    const messageForm = document.querySelector('#contact-form');
    if (messageForm) {
        messageForm.addEventListener('submit', (e) => {
            e.target.preventDefault();
            const name = document.querySelector('#contact-name');
            const email = document.querySelector('#contact-email');
            const message = document.querySelector('#contact-message');
            if (name && email && message) {
                sendMessage(name, email, message);
            }
        });
    }
}

//métodos
function addProductToCart(event) {
    const button = event.currentTarget;
    const productInfos = button.parentElement.parentElement;
    const productTitle = productInfos.getElementsByClassName("product-title")[0].innerText;
    const productPrice = productInfos.getElementsByClassName("product-price")[0].innerText.replace("Custo:", "");

    const productsCartName = document.getElementsByClassName("cart-product-title");
    for (let i = 0; i < productsCartName.length; i++) {
        if (productsCartName[i].innerText === productTitle) {
            productsCartName[i].parentElement.parentElement.getElementsByClassName("product-qtd-input")[0].value++;
            updateTotal(); 
            return;
        }
    }

    let newCartProduct = document.createElement("tr");
    newCartProduct.classList.add("cart-product");

    newCartProduct.innerHTML =
        `
    <td class="product-identification"> 
        <strong class="cart-product-title">${productTitle}</strong>
    </td>
    <td>
        <span class="cart-product-price">${productPrice}</span>
    </td>
    <td>
        <input class="product-qtd-input" type="number" value="1" min="0">
        <button class="remove-product-button" type="button">Remover</button>
    </td>
`;

    const tableBody = document.querySelector(".cart-table tbody");
    tableBody.append(newCartProduct);

    updateTotal();

    newCartProduct.getElementsByClassName("product-qtd-input")[0].addEventListener("change", updateTotal);
    newCartProduct.getElementsByClassName("remove-product-button")[0].addEventListener("click", removeProducts);
}

function removeProducts(event) {
    event.target.parentElement.parentElement.remove();
    updateTotal();
}

function updateTotal() {
    let totalAmount = 0;
    const cartProducts = document.getElementsByClassName("cart-product");
    for (let i = 0; i < cartProducts.length; i++) {
        const productPrice = cartProducts[i].getElementsByClassName("cart-product-price")[0].innerText.replace("R$", "").replace(",", ".");
        const productQuantity = cartProducts[i].getElementsByClassName("product-qtd-input")[0].value;
        totalAmount = totalAmount + (productPrice * productQuantity);
    }

    totalAmount = totalAmount.toFixed(2);
    totalAmount = totalAmount.replace(".", ",");
    document.querySelector(".cart-total-container span").innerText = "R$" + totalAmount;
}

function createProductItem(name, description, price, base64Image) {
    const newItem = document.createElement("div");
    newItem.classList.add("item");

    const img = document.createElement('img');
    img.src = base64Image;
    img.alt = name;
    newItem.innerHTML = `
        <div class="product-info">
            <button class="close-button">
                <svg xmlns="http://www.w3.org/2000/svg" class="bi-x-square" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                </svg>
            </button>
            <h3 class="product-title">${name}</h3>
            <p class="product-ingredients">Descrição: ${description}</p>
            <p class="product-price">Custo: R$ ${price}</p>
            <div class="product-actions">
                <button class="add-to-cart-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart-plus" viewBox="0 0 16 16">
                        <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z"/>
                        <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                    </svg>
                </button>
                <button class="edit-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    newItem.prepend(img);

    addEventListenersToNewElements(newItem);

    return newItem;
}

function updateProducts(allProducts) {
    const gallery = document.querySelector(".gallery");
    console.log("allProducts:", allProducts); // Verifica se allProducts está sendo passado corretamente
    if (allProducts) {
        for (let key in allProducts) { 
            if (allProducts.hasOwnProperty(key)) {
                const produto = allProducts[key];
                console.log("produto:", produto); // Verifica os detalhes do produto
                
                const name = produto.name;
                const description = produto.description;
                const price = produto.price;
                const image = produto.imagem;
                
                const product = createProductItem(name, description, price, image);
                console.log("Product item created:", product); // Verifica o elemento HTML criado
                
                gallery.appendChild(product);
            }
        }
    } else {
        console.error("Erro: Dados dos produtos não carregados corretamente.");
    }
}

/*
function deleteProducts() {
    let product = '<?xml version="1.0" encoding="UTF-8"?><catalog>';

    const productItems = document.querySelectorAll(".item");

    productItems.forEach(item => {
        const productTitleElement = item.querySelector(".product-title");
        const productDescriptionElement = item.querySelector(".product-ingredients");
        const productPriceElement = item.querySelector(".product-price");
        const productImageElement = item.querySelector("img");

        if (productTitleElement && productDescriptionElement && productPriceElement && productImageElement) {
            const productName = productTitleElement.textContent;
            const productDescription = productDescriptionElement.textContent.replace("Descrição: ", "");
            const productPrice = productPriceElement.textContent.replace("Custo: R$ ", "");
            const productImage = productImageElement.src;

            product += `<product><name>${productName}</name><description>${productDescription}</description><price>${productPrice}</price><image>${productImage}</image></product>`;
        }
    });

    product += '</catalog>';

    const blob = new Blob([product], { type: 'text/xml' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'produtos.xml';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
}
*/

function addEventListenersToNewElements(newItem) {
    const addToCartBtn = newItem.querySelector(".add-to-cart-btn");
    const removeProductBtn = newItem.querySelector(".remove-product-button");
    const editItem = newItem.querySelector(".edit-button");
    const productQtdInput = newItem.querySelector(".product-qtd-input");
    const removeItem = newItem.querySelector(".close-button");
    const editProductSection = document.querySelector(".edit-product-section");

    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", addProductToCart);
    }

    if (editItem) {
        editItem.addEventListener("click", () => {
            const productInfo = editItem.closest(".product-info");
            editProductSection.style.display = "block";
            editProductSection.scrollIntoView({ behavior: 'smooth' });
            loadProduct(productInfo, editProductSection);
        });
    }
    
    if (removeProductBtn) {
        removeProductBtn.addEventListener("click", removeProducts);
    }

    if (productQtdInput) {
        productQtdInput.addEventListener("change", updateTotal);
    }

    if (removeItem) {
        removeItem.addEventListener("click", (event) => {
            if(confirm("Realmente deseja apagar o produto?")){
                try {
                    const productTitle = event.target.closest('.product-info').querySelector('.product-title').textContent;
                    if (productTitle) {
                        deleteProduct(productTitle);
                        removeItem.parentElement.parentElement.remove();
                    }
                } catch (err) {
                    alert("Não foi possível apagar o produto!");
                    console.error(err);
                }
            }
        });
    }
    
}

function addEventListeners() {
    const addToCartButtons = document.getElementsByClassName("add-to-cart-btn");
    for (let i = 0; i < addToCartButtons.length; i++) {
        addToCartButtons[i].addEventListener("click", addProductToCart);
    }

    const removeProductButtons = document.getElementsByClassName("remove-product-button");
    for (let i = 0; i < removeProductButtons.length; i++) {
        removeProductButtons[i].addEventListener("click", function(event) {
            event.target.parentElement.parentElement.remove();
            updateTotal();
        });
    }

    const quantityInputs = document.getElementsByClassName("product-qtd-input");
    for (let i = 0; i < quantityInputs.length; i++) {
        quantityInputs[i].addEventListener("change", updateTotal);
    }

    const editItemButton = document.getElementsByClassName("edit-button");
    for (let i = 0; i < quantityInputs.length; i++) {
        editItemButton[i].addEventListener("click", function () {
            const editProductSection = document.querySelector(".edit-product-section");
            editProductSection.style.display = "block";
            editProductSection.scrollIntoView({ behavior: 'smooth' }); 
        });
    }
}

function finalisePurchase () {
    let textXML = '<?xml version="1.0" encoding="UTF-8"?><ITENS>';
    let boughtItem = document.querySelectorAll(".cart-product");
    boughtItem.forEach(product => {
        let name = product.querySelector(".cart-product-title").innerHTML;
        let price = product.querySelector(".cart-product-price").innerHTML;
        let amount = product.querySelector(".product-qtd-input").value;
    
        textXML += `<SOLD><NAME>${name}</NAME><PRICE>${price}</PRICE><AMOUNT>${amount}</AMOUNT></SOLD>`;
    });
    let total = document.querySelector(".cart-total-container span").innerHTML;
    textXML += `<SOLD><TOTAL>${total}</TOTAL></SOLD></ITENS>`;
    
    const blob = new Blob([textXML], { type: 'text/xml' });
    
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comprovante.xml';
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    
}


// novos metodos
function getProducts() {
    const dbref = ref(db);
    return new Promise((resolve, reject) => {
        get(child(dbref, "produtos/")).then((snapshot) => {
            if (snapshot.exists()) {
                const produtos = snapshot.val();
                const allProducts = [];
                for (const key in produtos) {
                    if (produtos.hasOwnProperty(key)) {
                        const produto = produtos[key];
                        allProducts.push({
                            name: key,
                            description: produto.descricao,
                            price: produto.preco,
                            imagem: produto.imagem
                        });
                    }
                }
                // Aqui você pode usar a lista allProducts conforme necessário
                resolve(allProducts);
            } else {
                reject("Produto não cadastrado");
            }
        }).catch((error) => {
            reject("Erro ao obter os dados: " + error);
        });
    });
}

function insertProducts(inputname, inputdescription, inputprice, inputimagem) {
    set(ref(db, "produtos/" + inputname), {
        descricao: inputdescription,
        preco: inputprice,
        imagem: inputimagem
    }).then(() => {
        console.log("Incluído com sucesso");
    }).catch((error) => {
        console.log("Erro de inclusão", error);
    });
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function searchProducts (searchInput, filter) {
    const dbref = ref(db);
    return new Promise((resolve, reject) => {
        //POR NOME
        if (filter === 'name') {
            get(child(dbref, 'produtos')).then((snapshot) => {
                if (snapshot.exists()) {
                    const produtos = snapshot.val();
                    const allProducts = [];
                    searchInput = removeAccents(searchInput);
                    const searchTerms = searchInput.toLowerCase().split(' ');
        
                    for (const nomeProduto in produtos) {
                        if (produtos.hasOwnProperty(nomeProduto)) {
                            const produtoNome = removeAccents(nomeProduto.toLowerCase());
                            const matches = searchTerms.every(term => produtoNome.includes(term));
                            if (matches) {
                                const produto = produtos[nomeProduto];
                                allProducts.push({
                                    name: nomeProduto,
                                    description: produto.descricao,
                                    price: produto.preco,
                                    imagem: produto.imagem
                                });
                            }
                        }
                    }
        
                    if (allProducts.length > 0) {
                        while (document.querySelector(".gallery").firstChild) {
                            document.querySelector(".gallery").removeChild(document.querySelector(".gallery").firstChild);
                        }
                        resolve(allProducts);
                    } else {
                        reject("Produto não encontrado");
                    }
                } else {
                    reject("Produto não encontrado");
                }
            }).catch((error) => {
                reject("Erro ao obter os dados: " + error);
            });
        }
        
        // POR PREÇO        
        if (filter === 'price') {
            get(child(dbref, 'produtos')).then((snapshot) => {
                if (snapshot.exists()) {
                    const produtos = snapshot.val();
                    const allProducts = [];
                    const searchPrice = searchInput; // Converter o termo de busca para número
                    for (const nomeProduto in produtos) {
                        if (produtos.hasOwnProperty(nomeProduto)) {
                            const price = produtos[nomeProduto].preco; // Converter o preço do produto para número, se necessário
                            if (price.includes(searchPrice)) {
                                const produto = produtos[nomeProduto];
                                allProducts.push({
                                    name: nomeProduto,
                                    description: produto.descricao,
                                    price: produto.preco,
                                    imagem: produto.imagem
                                });
                            }
                        }
                    }
            
                    if (allProducts.length > 0) {
                        while (document.querySelector(".gallery").firstChild) {
                            document.querySelector(".gallery").removeChild(document.querySelector(".gallery").firstChild);
                        }
                        resolve(allProducts);
                    } else {
                        reject("Produto não encontrado");
                    }
                } else {
                    reject("Produto não encontrado");
                }
            }).catch((error) => {
                reject("Erro ao obter os dados: " + error);
            });
            
        }
        
            // POR DESCRIÇÃO
            if (filter === 'description') {
                get(child(dbref, 'produtos')).then((snapshot) => {
                    if (snapshot.exists()) {
                        const produtos = snapshot.val();
                        const allProducts = [];
                        searchInput = removeAccents(searchInput);
                        const searchTerms = searchInput.toLowerCase().split(' ');

                        for (const nomeProduto in produtos) {
                            if (produtos.hasOwnProperty(nomeProduto)) {
                                const descricao = removeAccents(produtos[nomeProduto].descricao).toLowerCase();
                                console.log(descricao, searchTerms);
                                const matches = searchTerms.every(term => descricao.includes(term));
                                if (matches) {
                                    const produto = produtos[nomeProduto];
                                    allProducts.push({
                                        name: nomeProduto,
                                        description: produto.descricao,
                                        price: produto.preco,
                                        imagem: produto.imagem
                                    });
                                }
                            }
                        }
                
                        if (allProducts.length > 0) {
                            while (document.querySelector(".gallery").firstChild) {
                                document.querySelector(".gallery").removeChild(document.querySelector(".gallery").firstChild);
                            }
                            resolve(allProducts);
                        } else {
                            reject("Produto não encontrado");
                        }
                    } else {
                        reject("Produto não encontrado");
                    }
                }).catch((error) => {
                    reject("Erro ao obter os dados: " + error);
                });
            }
    });
}
  
function deleteProduct(product){
        remove(ref(db, `produtos/${product}`)).then(()=>{
              console.log("Excluído com sucesso");
         })
         .catch((error)=>{
              console.log(error);
         })    
}

function loadProduct(productInfo, editForm) {
    const oldName = productInfo.querySelector('.product-title').textContent.trim();
    const description = productInfo.querySelector('.product-ingredients').textContent.replace('Descrição: ', '').trim();
    const price = productInfo.querySelector('.product-price').textContent.replace('Custo: R$ ', '').trim();

    // Atualizar o texto do elemento <h2> com a classe .old-name
    editForm.querySelector('.old-name').textContent += ' ' + oldName;

    // Preencher os campos do formulário com os dados do produto selecionado
    editForm.querySelector('#product-name').value = oldName;
    editForm.querySelector('#product-description').value = description;
    editForm.querySelector('#product-price').value = price;
}


function editProduct(oldName, newName, description, price, image) {
    return new Promise((resolve, reject) => {
        if (!newName || !description || !price || !image) {
            alert("Todos os campos do novo produto devem ser fornecidos");
            reject(new Error("Todos os campos do novo produto devem ser fornecidos"));
            return;
        }

        const oldProductRef = ref(db, `produtos/${oldName}`);
        const newProductRef = ref(db, `produtos/${newName}`); 

        get(oldProductRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    set(newProductRef, {
                        descricao: description,
                        preco: price,
                        imagem: image
                    }).then(() => {
                        remove(oldProductRef)
                            .then(() => {
                                console.log("Produto atualizado com sucesso");
                                resolve();
                            })
                            .catch((error) => {
                                console.log("Erro ao remover o produto antigo:", error);
                                reject(error);
                            });
                    }).catch((error) => {
                        console.log("Erro ao criar o novo produto:", error);
                        reject(error);
                    });
                } else {
                    console.log("O produto antigo não existe");
                    reject(new Error("O produto antigo não existe"));
                }
            })
            .catch((error) => {
                console.log("Erro ao obter o produto antigo:", error);
                reject(error);
            });
    });
}

function sendMessage (inputEmail, inputMensagem, inputNome) {
    const dbref = ref(db);
    set(child(dbref, 'mensagens'), {
        email: inputEmail,
        mensagem: inputMensagem,
        nome: inputNome
    }).then(() => {
        console.log("Mensagem enviada com sucesso");
    }).catch((error) => {
        console.log("Erro de envio", error);
    });    
}