let login = (val) => {
  $.ajax({
    type: "POST",
    url: `/casino/login`,
    data: JSON.stringify({
      username: document.getElementById("username")?.value ?? "UnProvided",
      password: document.getElementById("password")?.value ?? "UnProvided",
      login: val == "out" ? false : true,
    }),
    dataType: "json",
    contentType: "application/json",
    success: async (res) => {
      if (res.error) {
        let errorAlert = document.getElementById("errorAlert");
        errorAlert.innerHTML = res.message;
        errorAlert.classList.remove("hidden");
      } else location.href = location.href;
    },
  });
};

let convert = (item) => {
  let itemsList = document.getElementById("itemsList").innerHTML;
  document.getElementById(
    "itemsList"
  ).innerHTML = `<div class="loader mx-auto items-center flex md:mt-24"></div>`;
  $.ajax({
    type: "POST",
    url: `/casino/convert`,
    data: JSON.stringify({
      item,
    }),
    dataType: "json",
    contentType: "application/json",
    success: async (res) => {
      if (res.error) tata.error("Convert Items to Bc", res.message);
      else {
        document.getElementById("itemsList").innerHTML = itemsList;
        document.getElementById(item).remove();
        document.getElementById("bluecoins").innerText = res.bluecoins;
        document.getElementById("itemsLength").innerText = res.itemsLength;
        tata.success("Convert Items to Bc", res.message);
      }
    },
  });
};

let loadBetPop = async (bcValue, betMsg, bet, item, itemName) => {
  document.getElementById("betAmount").innerText = bcValue;
  document.getElementById("bcMsg").innerText = betMsg;
  if (item) {
    let img = document.getElementById("betItem");
    img.setAttribute("src", `/public/imgs/items/wiki/${itemName}.png`);
    img.classList.add("ml-12");
    img.classList.remove("hidden");
  } else document.getElementById("betItem").classList.add("hidden");
  let element = await document.body;
  setTimeout(() => {
    element.classList.add(!bet ? "active" : "unactive");
  }, 100);

  setTimeout(() => {
    element.classList.remove(!bet ? "active" : "unactive");
  }, 5000);
};
let gamblebc = () => {
  let bcoins = document.getElementById("betCoins")?.value;
  let bcBox = document.getElementById("bcBox").innerHTML;
  document.getElementById(
    "bcBox"
  ).innerHTML = `<div class="loader mx-auto items-center flex md:my-16 p-6"></div>`;
  $.ajax({
    type: "POST",
    url: `/casino/gambleBC`,
    data: JSON.stringify({
      bc: bcoins,
    }),
    dataType: "json",
    contentType: "application/json",
    success: async (res) => {
      document.getElementById("bcBox").innerHTML = bcBox;
      if (res.error) tata.error("Gambling bc", res.message);
      else {
        await loadBetPop(res.bcValue, res.betMsg, res.lose);
        document.getElementById("bluecoins").innerText = res.bluecoins;
      }
    },
  });
};

let gambleItem = (type) => {
  let itemsGambleBox = document.getElementById("itemsGambleBox").innerHTML;
  document.getElementById(
    "itemsGambleBox"
  ).innerHTML = `<div class="loader mx-auto items-center flex md:my-20 p-[23px]"></div>`;
  $.ajax({
    type: "POST",
    url: `/casino/gambleItem`,
    data: JSON.stringify({
      item: type,
    }),
    dataType: "json",
    contentType: "application/json",
    success: async (res) => {
      document.getElementById("itemsGambleBox").innerHTML = itemsGambleBox;

      if (res.error) tata.error("Item Gambling bc", res.message);
      else {
        await loadBetPop(
          res.bcValue,
          res.betMsg,
          res.lose,
          res.item,
          res.itemName
        );
        document.getElementById("bluecoins").innerText = res.bluecoins;
        if (res.itemsLength)
          document.getElementById("itemsLength").innerText = res.itemsLength;
      }
    },
  });
};

const startLogging = () => {
  setInterval(() => {
    $.ajax({
      type: "GET",
      url: `/casinolog`,
      contentType: "application/json",
      success: async (res) => {
        let logs = "";
        res.logs.map((i) => {
          if (i !== null)
            logs += `<div class="flex justify-center">
            <div class="bg-primary-200 rounded-xl my-3 py-5 px-6 w-full md:flex items-center">
            ${
              i.item
                ? `<img class="w-24 cursor-pointer duration-100 hover:opacity-70" onclick="window.open('/wiki?term=${i.item}')" src="public/imgs/items/wiki/${i.item}.png" />`
                : '<b class="text-6xl mr-9"><i class="fa-solid fa-coins"></i></b>'
            }

                <div>
                    <p class="text-md font-bold">${i.user}</p>
                    <p class="text-sm font-semibold">${i.type}</p>
                    <div class="flex flex-wrap mt-2 text-sm">
                        <p class="rounded-xl py-1 px-3 bg-primary-400 font-bold w-fit mr-2"><a
                                class="flex duration-100 items-center font-semibold hover:text-gray-300"
                                href="/pricing#bluecoins"><img class="h-5"
                                    src="/public/imgs/bluecoins.png">&nbsp;<b>${
                                      i.amount
                                    }&nbsp;bc</b></a></p>
                                <p class="rounded-xl py-1 px-3 bg-primary-400 font-bold w-fit mr-2">${
                                  i.date
                                }</p>
                        ${
                          i.status == "Lost" && i.mainType !== "convert"
                            ? '<p class="rounded-xl text-black py-1 px-3 bg-red-600 font-bold w-fit mr-2">Lost the Bet!</p>'
                            : '<p class="rounded-xl text-black py-1 px-3 bg-green-600 font-bold w-fit mr-2">Won the bet!</p>'
                        }
                    </div>
                </div>
            </div>
        </div>`;
        });

        document.getElementById("bets").innerHTML =
          logs == ""
            ? "<p class='my-5 text-red-200 text-center font-semibold text-xl'>No recent logs at the moment</p>"
            : logs;
      },
    });
  }, 1500);
};
