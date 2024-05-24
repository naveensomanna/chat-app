const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// query string

const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true })


const autoScroll=()=>{
    // new message element

    const $newMessage=$messages.lastElementChild;

     const newMessageStyle=  getComputedStyle($newMessage);
     const newMessageStyleMargin=parseInt(newMessageStyle.marginBottom);
    const newMessageHeight= $newMessage.offsetHeight + newMessageStyleMargin

     // visible height

     const visibleHeight=$messages.offsetHeight;


     // height of messages container
     const containerHeight=$messages.scrollHeight;



     const scrollOffset=$messages.scrollTop + visibleHeight;


     if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight;
     }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        username:message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        url: message.url,
        username:message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
})



socket.on("roomData",(data)=>{
    const html=Mustache.render(sidebarTemplate,{
        room:data.room,
        users:data.users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})





socket.emit("join",{
    username,
    room
},(err)=>{
    if(err){
        alert(err)
        location.href="/"
    }
})