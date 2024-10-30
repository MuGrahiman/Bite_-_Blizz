let addIngredientsBtn = document.getElementById('addIngredientsBtn');
let ingredientList = document.getElementById('ingredientList');
let ingredientDiv = document.getElementById('ingredientDiv');

 addIngredientsBtn.addEventListener('click',()=>{
    let newIngredients = ingredientDiv.cloneNode(true);
    let input = newIngredients.getElementsByTagName('input')[0];
    input.value = '';
    ingredientList.appendChild(newIngredients);
 })