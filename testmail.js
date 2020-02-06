
let currentDate = new Date(),
day = currentDate.getDate(),
month = currentDate.getMonth() + 1,
year = currentDate.getFullYear(),
date = day + '-' + month + '-' + year;

const today = currentDate.getDay()

console.log(today, "today")
