let next = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  const search = urlParams.get('term');

  location.href = `${location.protocol + '//' + location.host + location.pathname}?page=${eval(Math.abs(page || 0) + 1)}${search ? `&term=${search}` : ""}`
}

let prev = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  const search = urlParams.get('term');

  location.href = `${location.protocol + '//' + location.host + location.pathname}?page=${eval(Math.abs(page || 0) - 1) <= 0 ? 1 : eval(Math.abs(page || 0) - 1)}${search ? `&term=${search}` : ""}`
}

function goTopage(count) {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  const search = urlParams.get('term');

  location.href = `${location.protocol + '//' + location.host + location.pathname}?page=${count}${search ? `&term=${search}` : ""}`
}

let input = document.getElementById("searchBar");

document.getElementById("searchBar").setAttribute("value",  new URLSearchParams(window.location.search).get('term') ?? "")
let searchImage = () => {
  location.href = `${location.protocol + '//' + location.host}/wiki?term=${input?.value == "" ? "prem" : input.value}`
}

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchImage()
  }
});