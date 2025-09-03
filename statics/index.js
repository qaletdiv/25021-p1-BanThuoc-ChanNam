import { products } from "./mock-data.js";

if (!localStorage.getItem("products")) {
    localStorage.setItem("products",JSON.stringify(products));
}  
const data = localStorage.getItem("products");
console.log(JSON.parse(data));

// window.location.href = "./home-page/home-page.html";