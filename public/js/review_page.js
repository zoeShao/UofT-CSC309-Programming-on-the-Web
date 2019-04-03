import {getLogInInfo, signOutUser} from './navBar.js';
/* Class */
class User {
	constructor(image, name, email, password, type){
        this.image = image;
        this.name = name;
        this.email = email;
        this.password = password;
        this.type = type;
        this.reviews = [];
        this.favourite = [];
    }
}

// class Restaurant{
//     constructor(image, name, phone, address, rate, price){
//         this.image = image;
//         this.name = name;
//         this.phone = phone;
//         this.address = address;
//         this.rate = rate;
//         this.price = price;
//         this.reviews = [];
//     }
// }

// class Review {
//     constructor(rName, uName, rate, price, content){
//         this.rName = rName;
//         this.uName = uName;
//         this.rate = rate;
//         this.price = price;
//         this.content = content;
//     }
// }

/* Global variables */
let maxReviews = 4 // max Contents one page can show
let currentPage = 1 // current page number
let reviewLst = [];
let store = null

//Server part TODO: get data from the server and load them to the page

/* Examples(hardcode part) */
// const storeImg = "https://upload.wikimedia.org/wikipedia/commons/4/4b/McDonald%27s_logo.svg"
// const store = new Restaurant(storeImg, "McDonald's", "1234567890", "552 Yonge St, Toronto", 3, 1)
// create a review
// const review1 = new Review("McDonald's", "user1", 3, 1, "here is the review.here is the review.here is the review.here is the review.")
// const review2 = new Review("McDonald's", "user2", 2, 1, "here is the review.here is the review.")
// // create a user
// const userImg = "avatar.jpg"
// const user = new User(userImg, "user", "user@mail.com", "user", "i")
// // Add these reviews to the user's review array (does not change the DOM)
// store.reviews.push(review1)
// store.reviews.push(review2)

/* Select all DOM form elements you'll need. */ 
const reviewForm = document.querySelector('#reviewForm')
const reviewPart = document.querySelector('#reviewPart')
const pager = document.querySelector('#pager')
const bookmark = document.querySelector('#bookmark')

/* Load the initial page. */ 
// showPage(currentPage)
getReviews()
/* call functions from navBar.js*/
getLogInInfo();
window.signOutUser = signOutUser;

/* Event listeners for button submit and button click */
reviewForm.addEventListener('submit', addNewReview);
pager.addEventListener('click', changePage);
reviewForm.addEventListener('keydown', modifyButton);
bookmark.addEventListener('click', changeBookmark);
getRestaurant()
/*-----------------------------------------------------------*/
/*** 
Functions can call DOM functions 
***/
//helper function to form a form data by user's input
function formData(){
    const form = new FormData();
    form.append("resID", store._id);
    form.append("price", document.querySelector('#FormControlSelect1').value);
    form.append("rate", document.querySelector('#FormControlSelect2').value);
    form.append("content", document.querySelector('#FormControlTextarea1').value);
    return form;
}

function modifyButton(e) {
    e.target.parentElement.nextElementSibling.className = "float-right btn btn-info"
}

function addNewReview(e) {
    e.preventDefault();
    const url = '/addReview/store._id'
    const form = formData();
  
    //Server part TODO: add the review to the server
    if (e.target.lastElementChild.innerText === 'Submit') {
        // const userName = "user";
        // const storeName = "McDonald's";
        // const price = document.querySelector('#FormControlSelect1').value;
        // const rate = document.querySelector('#FormControlSelect2').value;
        const content = document.querySelector('#FormControlTextarea1').value;
        if (content) {
            // const newReview = new Review(storeName, userName, rate, price, content)
            // reviewLst.unshift(newReview)
            getReviews()
            showPage(currentPage)
            e.target.lastElementChild.innerText = 'Resubmit'
        } else {
            e.target.lastElementChild.className = "float-right btn btn-info disabled"
        }
    } else {
        // const userName = "user";
        // const storeName = "McDonald's";
        // const price = document.querySelector('#FormControlSelect1').value;
        // const rate = document.querySelector('#FormControlSelect2').value;
        const content = document.querySelector('#FormControlTextarea1').value;
        if (content) {
            for (let i = 0; i < reviewLst.length; i++) {
                if (reviewLst[i].uName === userName) {
                    reviewLst[i].rate = rate
                    reviewLst[i].price = price 
                    reviewLst[i].content = content
                }
            }
            showPage(currentPage)
        } else {
            e.target.lastElementChild.className = "float-right btn btn-info disabled"
        }
    }
}

function changePage(e) {
    e.preventDefault();
    if (e.target.classList.contains('previous')) {
        if (currentPage > 1) {
            currentPage = currentPage - 1
            showPage(currentPage)
        }

    } else if (e.target.classList.contains('next')) {
        if ((currentPage * maxReviews) < reviewLst.length) {
            currentPage = currentPage + 1
        }
        showPage(currentPage)       
    }
}

function changeBookmark(e) {
    e.preventDefault();
    if (e.target.classList.contains('notbookmarked')) {
        e.target.parentElement.innerHTML = "<i class=\"bookmarked fas fa-bookmark\"></i>"
        //Server part TODO: Get user data from server and push the store to his/her favourite list
        // code below requires server call
        user.favourite.push(store)
    } else if (e.target.classList.contains('bookmarked')) {
        e.target.parentElement.innerHTML = "<i class=\"notbookmarked far fa-bookmark\"></i>"
        //Server part TODO: Get user data from server and remove the store to his/her favourite list
        // code below requires server call
        user.favourite.splice(user.favourite.indexOf(store), 1)
    }
}

/*-----------------------------------------------------------*/
/*** DOM functions below - use these to create and edit DOM objects ***/
function addReviewToDom(review) {
    console.log("hey!")
    const contentBoxElement = document.createElement('div')
    contentBoxElement.className = "contentBox"
    const userImgElement = document.createElement('div')
    userImgElement.classNmae = "userImgContainer"
    const userImg = document.createElement('img')
    userImg.className = "userImg img-thumbnail rounded-circle"
    userImg.src = "https://finanzmesse.ch/userdata/uploads/referenten/avatar.jpg"
    userImg.alt = "avatar Picture"
    userImgElement.appendChild(userImg)
    contentBoxElement.appendChild(userImgElement)
    const contentElement = document.createElement('div')
    contentElement.className = "storeContainer"
    const rateElement = addRateToDom(review.rate)
    const priceElement = addPriceToDom(review.price)
    const content = document.createElement('p')
    content.innerHTML = "<strong>"+`${review.userName}`+":\" </strong>" + `${review.content}` +  "<strong>\"</strong>"
    contentElement.appendChild(rateElement)
    contentElement.appendChild(priceElement)
    contentElement.appendChild(content)
    contentBoxElement.appendChild(contentElement)
    reviewPart.appendChild(contentBoxElement)
}

function addRestaurantToDom(store) {
    const restaurantInfoHeader = document.querySelector('#restaurantHeader')
    const restaurantInfoBody = document.querySelector('#restaurantInfo')
    // restaurant info header
    const restaurantHeader = document.createElement('div')
    restaurantHeader.className = "col-md-10"
    const restaurantPara = document.createElement('p')
    restaurantPara.className = "storeName text-dark"
    const strongElement = document.createElement('strong')
    strongElement.innerText = store.name
    restaurantPara.appendChild(strongElement)
    restaurantHeader.appendChild(restaurantPara)
    restaurantInfoHeader.insertBefore(restaurantHeader, restaurantInfoHeader.firstChild)
    // restaurant picture body
    const restaurantImg = document.createElement('div')
    restaurantImg.className = "col-md-3"
    const divElement = document.createElement('div')
    divElement.className = "RestaurantImgContainer"
    const storeImg = document.createElement('img')
    const url = '/readImg/';
    storeImg.src = url + store.picture;
    // storeImg.src = store.image
    storeImg.alt = "Store Picture";
    divElement.appendChild(storeImg)
    restaurantImg.appendChild(divElement)
    restaurantInfoBody.insertBefore(restaurantImg, restaurantInfoBody.firstChild)
    // restaurant info body
    const restaurantInfoPart = document.createElement('div')
    restaurantInfoPart.className = "col-md-7"
    const addressElement = document.createElement('p')
    addressElement.innerHTML = "<strong>Restaurant address: </strong>" + `${store.address}`
    const telElement = document.createElement('p')
    telElement.innerHTML = "<strong>Restaurant tel: </strong>" + `${store.phone}`
    const rateElement = addRateToDom(store.rate)
    const priceElement = addPriceToDom(store.price)
    restaurantInfoPart.appendChild(addressElement)
    restaurantInfoPart.appendChild(telElement)
    restaurantInfoPart.appendChild(rateElement)
    restaurantInfoPart.appendChild(priceElement)
    restaurantInfoBody.appendChild(restaurantInfoPart)
}

/*-----------------------------------------------------------*/
/*** helper functions ***/
function showPage(currentPage) {
    console.log(reviewLst.length)
    // var queryString = decodeURIComponent(window.location.search);
    // queryString = queryString.substring(1);
    // var id = qs.get("myVar1");
    // console.log(queryString)
    // addRestaurantToDom(store)
    let restPage = reviewLst.length - currentPage * 4
    console.log(restPage)
    if (restPage >= 0) {
        console.log("???")
        reviewPart.innerText = ""
        for (let i = 0; i < maxReviews; i++) {
            let j = ((currentPage-1)*4) + i
            console.log(j)
            addReviewToDom(reviewLst[j])
        }
    } else {
        console.log("!!!!!")
        restPage = maxReviews + restPage
        reviewPart.innerText = ""
        for (let i = 0; i < restPage; i++) {
            let j = ((currentPage-1)*4) + i
            console.log(j)
            addReviewToDom(reviewLst[j])
        }
    }
}

function addRateToDom(rate) {
    const paraElement = document.createElement('p')
    const strongElement = document.createElement('strong')
    strongElement.innerText = "Rate: "
    paraElement.appendChild(strongElement)
    const linkElement = document.createElement('link')
    linkElement.rel = "stylesheet"
    linkElement.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    paraElement.appendChild(linkElement)
    for (let i = 0; i < rate; i++) {
        const spanElement = document.createElement('span')
        spanElement.className = "fa fa-star checked"
        paraElement.appendChild(spanElement)
    }
    for (let i = rate; i < 5; i++) {
        const spanElement = document.createElement('span')
        spanElement.className = "fa fa-star"
        paraElement.appendChild(spanElement)
    }
    return paraElement
}

function addPriceToDom(rate) {
    const paraElement = document.createElement('p')
    let priceRate = ''
    for (let i = 0; i < rate; i++) {
        priceRate = priceRate + '$'
    }
    paraElement.innerHTML = '<strong>Price: </strong>' + priceRate
    return paraElement
}

//get the restaurant info and then display 
function getRestaurant(){
    const url = '/restaurantInfo';
    $.ajax({
        url: url,
        method:'get'
    }).done((res) =>{
        if(res){
            console.log(res.restaurant)
            store = res.restaurant;
            addRestaurantToDom(store)
            showPage(currentPage);
        }
        else{
            alert("cannot get restaurant");
        }
    }).fail((error) =>{
        alert("cannot get restaurant");
        console.log(error);
    })
}

//get all the reviews of the restaurant
function getReviews(){
    const url = '/getResReview';
    $.ajax({
        url: url,
        method:'get'
    }).done((res) =>{
        if(res.reviews){
            console.log(res.reviews)
            console.log(res.reviews[0])
            reviewLst = res.reviews
            console.log(reviewLst.length)
            console.log(reviewLst[0].userName)
        }
        else{
            alert("cannot get reviews");
        }
    }).fail((error) =>{
        alert("cannot get reviewss");
        console.log(error);
    })
}