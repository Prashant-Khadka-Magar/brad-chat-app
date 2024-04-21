const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const socket = io();
const messageBox=document.getElementById("msg")

//Get username and room from URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const username = urlParams.get("username");
const room = urlParams.get("room");

//Join chatroom
socket.emit("joinRoom", { username, room });

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//listen for notification
socket.on("notification", (notification) => {
  outputNotification(notification);
});

//listen for messages
socket.on("message", (message) => {
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//while typing
msg.addEventListener('keypress',()=>{
  socket.emit('typing')
})

let activityTimer;
let typingBox=document.querySelector('.typing')
//display typing
socket.on("activity",(activity)=>{
  typingBox.textContent = activity

  clearTimeout(activityTimer);

  activityTimer = setTimeout(() => {
    typingBox.textContent = "";
  }, 3000);
})

//on Message Submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  //Emitting a message to a server
  socket.emit("chatMessage", msg);

  //clear and focus input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//Output Messages into DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  if(message.username===username){
    div.classList.add("my-message");
  }
  div.innerHTML = ` <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//Output notification into DOM
function outputNotification(notification) {
  const p = document.createElement("p");
  p.classList.add("notification");
  p.innerHTML = notification;
  document.querySelector(".chat-messages").appendChild(p);
}

//Add Room Name to Dom
function outputRoomName(room) {
  document.getElementById("room-name").innerText = room;
}

//add users in the room into the DOM
function outputUsers(users) {
  let usersList = document.getElementById("users");
  usersList.innerHTML = `${users.map((user) => `<li>${user.username}</li>`).join('')}`;
}
