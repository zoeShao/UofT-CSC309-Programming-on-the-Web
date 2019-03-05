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

class Restaurant{
    constructor(image, name, phone, address, rate, price){
        this.image = image;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.rate = rate;
        this.price = price;
        this.reviews = [];
    }
}

class Review {
    constructor(rName, uName, rate, price, content){
        this.rName = rName;
        this.uName = uName;
        this.rate = rate;
        this.price = price;
        this.content = content;
    }
}

/* Global variables */
let maxReviews = 4 // max Contents one page can show
let currentPage = 1 // current page number

/* Examples(hardcode part) */
const storeImg = "https://upload.wikimedia.org/wikipedia/commons/4/4b/McDonald%27s_logo.svg"
const store = new Restaurant(storeImg, "McDonald's", "1234567890", "552 Yonge St, Toronto", 3, 1)
// create a review
const review1 = new Review("McDonald's", "user1", 3, 1, "here is the review.here is the review.here is the review.here is the review.")
const review2 = new Review("McDonald's", "user2", 2, 1, "here is the review.here is the review.")
// Add these reviews to the user's review array (does not change the DOM)
store.reviews.push(review1)
store.reviews.push(review2)

/* Select all DOM form elements you'll need. */ 
const reviewForm = document.querySelector('#reviewForm')
const reviewPart = document.querySelector('#reviewPart')
const pager = document.querySelector('#pager')

/* Load the initial page. */ 
showPage(currentPage)

/* Event listeners for button submit and button click */
reviewForm.addEventListener('submit', addNewReview);
pager.addEventListener('click', changePage)

/*-----------------------------------------------------------*/
/*** 
Functions that don't edit DOM themselves, but can call DOM functions 
***/
function addNewReview(e) {
    e.preventDefault();

    const userName = "user";
    const storeName = "McDonald's";
    const price = document.querySelector('#FormControlSelect1').value;
    const rate = document.querySelector('#FormControlSelect2').value;
    const content = document.querySelector('#FormControlTextarea1').value;
    const newReview = new Review(storeName, userName, rate, price, content)
    store.reviews.unshift(newReview)
    showPage(currentPage)
    // addReviewToDom(newReview)
}

function changePage(e) {
    e.preventDefault();
    if (e.target.classList.contains('previous')) {
        if (currentPage > 1) {
            currentPage = currentPage - 1
            showPage(currentPage)
        }

    } else if (e.target.classList.contains('next')) {
        if ((currentPage * maxReviews) < store.reviews.length) {
            currentPage = currentPage + 1
        }
        showPage(currentPage)       
    }
}

/*-----------------------------------------------------------*/
/*** DOM functions below - use these to create and edit DOM objects ***/
function addReviewToDom(review) {
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
    content.innerHTML = "<strong>"+`${review.uName}`+":\" </strong>" + `${review.content}` +  "<strong>\"</strong>"
    contentElement.appendChild(rateElement)
    contentElement.appendChild(priceElement)
    contentElement.appendChild(content)
    contentBoxElement.appendChild(contentElement)
    reviewPart.appendChild(contentBoxElement)
}

/*-----------------------------------------------------------*/
/*** helper functions ***/
function showPage(currentPage) {
    let restPage = store.reviews.length - currentPage * 4
    if (restPage >= 0) {
        reviewPart.innerText = ""
        for (let i = 0; i < maxReviews; i++) {
            let j = ((currentPage-1)*4) + i
            // console.log(j)
            addReviewToDom(store.reviews[j])
        }
    } else {
        restPage = maxReviews+restPage
        reviewPart.innerText = ""
        for (let i = 0; i < restPage; i++) {
            let j = ((currentPage-1)*4) + i
            // console.log(j)
            addReviewToDom(store.reviews[j])
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