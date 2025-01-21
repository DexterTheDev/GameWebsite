let openModel = (Token = 0, Bonus = 0, Price = 0) => {
    toggleModal(Token, Bonus, Price)
}
let closemodal = () => {
    toggleModal(0, 0, 0)
}

let closemodal2 = () => {
    toggleModal2("none")
}

let closemodal3 = () => {
    toggleModal3()
}
document.onkeydown = function (evt) {
    evt = evt || window.event
    let isEscape = false
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc")
    } else {
        isEscape = (evt.keyCode === 27)
    }
    if (isEscape && document.body.classList.contains('modal-active')) toggleModal()
    else if(isEscape && document.body.classList.contains('modal2-active')) toggleModal2()
    else if(isEscape && document.body.classList.contains('modal3-active')) toggleModal3()
};


function toggleModal(Token, Bonus, Price) {
    const body = document.querySelector('body')
    const modal = document.querySelector('.modal')
    modal.classList.toggle('opacity-0')
    modal.classList.toggle('pointer-events-none')
    body.classList.toggle('modal-active')
    document.getElementById("tokens").innerText = Token ? Token : 0;
    document.getElementById("bonus").innerText = Bonus ? Bonus : 0;
    document.getElementById("price").innerText = Price ? Price : 0;
}

function toggleModal2(Item = "Loading", Price = 0) {
    const body = document.querySelector('body')
    const modal = document.querySelector('.modal2')
    modal.classList.toggle('opacity-0')
    modal.classList.toggle('pointer-events-none')
    body.classList.toggle('modal2-active')
    document.getElementById("item").innerText = Item
    document.getElementById("Itemprice").innerText = Price;
}

function toggleModal3() {
    const body = document.querySelector('body')
    const modal = document.querySelector('.modal3')
    modal.classList.toggle('opacity-0')
    modal.classList.toggle('pointer-events-none')
    body.classList.toggle('modal3-active')
}

let purchase = (amount) => {
    $.ajax({
        type: "POST",
        url: `/purchase?amount=${amount}`,
        data: JSON.stringify({ bluetokens: true, username: document.getElementById("username").value }),
        dataType: "json",
        contentType: 'application/json',
        success: async (res) => {
            if (res.error) tata.error("Error", res.message)
            else {
                tata.success("Success", res.message)
                location.href = res.paypal
            }
        }
    });
}

let purchaseItem = (item) => {
    $.ajax({
        type: "POST",
        url: `/purchaseitem?item=${item}`,
        data: JSON.stringify({ username: document.getElementById("usernameItem").value }),
        dataType: "json",
        contentType: 'application/json',
        success: async (res) => {
            if (res.error) tata.error("Error", res.message)
            else {
                tata.success("Success", res.message)
                location.href = res.paypal
            }
        }
    });
}

let purchaseGc = () => {
    $.ajax({
        type: "POST",
        url: `/giftcode`,
        data: JSON.stringify({ username: document.getElementById("usernameGC").value }),
        dataType: "json",
        contentType: 'application/json',
        success: async (res) => {
            if (res.error) tata.error("Error", res.message)
            else {
                tata.success("Success", res.message)
                location.href = res.paypal
            }
        }
    });
}

let countDownDate = new Date(document.getElementById("stockcountdown").innerText).getTime();


let x = setInterval(function () {
    let now = new Date().getTime();
    let distance = countDownDate - now;
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("stockcountdown").innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";

    if (distance < 0) {
        clearInterval(x);
        document.getElementById("stockcountdown").innerHTML = "EXPIRED";
    }
}, 1000);