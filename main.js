import { GoogleGenerativeAI } from "@google/generative-ai";
// import md from "markdown-it"; // It is no longer being used in the code

// Initialize the model
const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_API_KEY}`);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let history = [];

async function getResponse(prompt) {
  const chat = await model.startChat({ history: history });
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const text = response.text();

  console.log(text);
  return text;
}

// user chat div
export const userDiv = (data) => {
  return `
  <!-- User Chat -->
          <div class="flex items-center gap-2 justify-start">
            <img
              src="user.jpg"
              alt="user icon"
              class="w-10 h-10 rounded-full"
            />
            <p class="bg-gemDeep text-white p-1 rounded-md shadow-md  ">
              ${data}
            </p>
          </div>
  `;
};

// AI Chat div
export const aiDiv = (data) => {
  return `
  <!-- AI Chat -->
          <div class="flex gap-2 justify-end">
            <p class="bg-gemRegular/40 text-gemDeep p-1 rounded-md shadow-md whitespace-pre-wrap">
              ${data}
            </p>
            <img
              src="chat-bot.jpg"
              alt="user icon"
              class="w-10 h-10 rounded-full"
            />
          </div>
  `;
  // I changed the pre tag to a regular p tag
};

let loadInterval;

// AI thinking about a statement (3 dots loading at an interval of 300 milliseconds)
function loader(item) {
  item.textContent = "";

  loadInterval = setInterval(() => {
    item.textContent += ".";

    if (item.textContent === "....") {
      item.textContent = "";
    }
  }, 300);
}

// Text stream function that writes a single charater every 20 milliseconds
function streamText(item, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      item.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

async function handleSubmit(event) {
  event.preventDefault();

  let userMessage = document.getElementById("prompt");
  const chatArea = document.getElementById("chat-container");

  var prompt = userMessage.value.trim();
  if (prompt === "") {
    return;
  }

  console.log("user message", prompt);

  chatArea.innerHTML += userDiv(prompt);
  userMessage.value = "";

  // Create a new div for the AI response and add it to the chat area
  const aiResponseDiv = document.createElement("div");
  aiResponseDiv.innerHTML = `
  <!-- AI Chat -->
  <div class="flex gap-2 justify-end">
    <p class="bg-gemRegular/40 text-gemDeep p-1 rounded-md shadow-md whitespace-pre-wrap">
    </p>
    <img
      src="chat-bot.jpg"
      alt="user icon"
      class="w-10 h-10 rounded-full"
    />
  </div>
`;
  chatArea.appendChild(aiResponseDiv);

  // Pass the p tag to the loader function
  const pTag = aiResponseDiv.querySelector("p");
  loader(pTag);

  const aiResponse = await getResponse(prompt);
  if (aiResponse !== null) {
    // let md_text = md().render(aiResponse); //I removed the markdown rendering because I don't really like how it looks
    clearInterval(loadInterval); // Stop the loading function
    pTag.innerText = "";
    // aiResponseDiv.innerHTML = aiDiv(md_text);
    streamText(pTag, aiResponse);

    let newUserRole = {
      role: "user",
      parts: prompt,
    };
    let newAIRole = {
      role: "model",
      parts: aiResponse,
    };

    history.push(newUserRole);
    history.push(newAIRole);
  } else {
    aiResponseDiv.innerHTML = aiDiv("Oops! An error occured.");
  }

  console.log(history);
}

const chatForm = document.getElementById("chat-form");
chatForm.addEventListener("submit", handleSubmit);

chatForm.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) handleSubmit(event);
});
