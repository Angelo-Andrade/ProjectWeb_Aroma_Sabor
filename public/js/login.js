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
                
                window.location.href = 'menu.html';            
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
                window.location.href = 'menu.html';
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