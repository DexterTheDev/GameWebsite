module.exports = {
    // SETUP
    port: 3000, // HOST PORT
    domain: "https://sticksurf.net",
    stockDate: "Oct 11, 2024",
    exclusive: [
        {
            name: "VIP Package",
            img: "deluxeit",
            price: "24.99"
        }
    ],
    chests: [
        {
            name: "Blue Chest",
            img: "blueChest",
            price: "14.99"
        },
        {
            name: "Deluxe Chest",
            img: "deluxeChest",
            price: "19.99"
        },
        {
            name: "Zephyr Chest",
            img: "zephyrChest",
            price: "19.99"
        },
        {
            name: "Deluxe Locker Chest",
            img: "deluxelockerchest",
            price: "31.99"
        },
    ],
    stockItems: [
        {
            name: "Green Shark Surfboard",
            img: "greensharksb",
            stats: "+5 Speed & +5 Jump",
            price: "44.99"
        }
    ],
    giftcodesChance:
    {
        // "itemname": "Change to get"
        "legendaryarmy": 8,
        "prempass": 6,
        "dragonbow": 6,
        "minigun": 6,
        "dragonhelm": 6,
        "furbyskin": 7,
        "soldierbg": 4,
        "thugmouth": 6,
        "randomitem": 7,
        "scientistshair": 6,
        "armygrenade": 6,
        "rainbowcolor": 6,
    }
    ,
    // CONFIG
    paypal: {
        'mode': "live",
        'client_id': "",
        'client_secret': ""
    }
}