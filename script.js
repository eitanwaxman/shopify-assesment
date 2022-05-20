OPENAI_API_KEY = "sk-9iTykVyyk2ySOg3f4pX1T3" + "BlbkFJJnZXDWWanttEQH7YuEjr";

const promptInput = document.getElementById("prompt");
const submitButton = document.getElementById("submit-button");
const loadTweetsButton = document.getElementById("load-tweets-button");
const responsesWrapper = document.getElementById("responses-wrapper");
const exampleResponse = document.getElementsByClassName("response")[0];

let RESPONSES = [];
let responsesCookie = "";

const checkIfCookieExists = () => {
  let cookiesArray = document.cookie.split(";");
  let responsesCookie;
  cookiesArray.forEach((cookie) => {
    if (cookie.trim().startsWith("responses=")) {
      responsesCookie = cookie.trim().substring(10);
    }
  });
  return responsesCookie;
};

if (checkIfCookieExists()) {
  RESPONSES = JSON.parse(checkIfCookieExists());
  loadTweetsButton.classList.remove("hidden");
}

console.log(RESPONSES);
//const savedResponses = browser.cookie.get(responses);
//console.log(savedResponses);

const handleSubmit = async () => {
  const prompt = promptInput.value;
  if (prompt !== "") {
    const newResponse = await arrangeDataIntoResponseObject(prompt);
    loadNewResponse(newResponse);
    promptInput.value = "";
  } else {
    window.alert("please enter a prompt!");
  }
};

const handleTweet = () => {
  console.log(
    "In an ideal world this would prompt Twitter API OAuth and allow the user to tweet directly to their account."
  );
};

const handleSave = (response) => {
  const responseExists =
    RESPONSES.length > 0 && RESPONSES.find(({ id }) => id === response, id);
  if (!responseExists) {
    RESPONSES.unshift(response);
    document.cookie = `responses=${JSON.stringify(RESPONSES)}`;
    console.log("saved");
  } else {
    console.log("response exists");
  }
};

const handleDelete = (response) => {
  const filteredResponses = RESPONSES.filter(({ id }) => id === response.id);
  RESPONSES = [...filteredResponses];
  document.cookie = `responses=${JSON.stringify(RESPONSES)}`;
  console.log("deleted");
};

const handleLoadTweets = () => {
  RESPONSES.forEach((response) => {
    loadNewResponse(response);
  });
};

const arrangeDataIntoResponseObject = async (prompt) => {
  const data = {
    prompt: prompt,
    temperature: 0.5,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  };
  let result = await fetchAPI(data);
  let { text } = result.choices[0];

  //saftey clause to ensure that character limit stays under Max 240
  while (text.length > 240) {
    result = await fetchAPI(data);
    text = result.choices[0].text;
  }

  const responseObject = {
    id: Math.floor(Math.random() * 100000000),
    prompt: prompt,
    response: text,
  };

  return responseObject;
};

const loadNewResponse = (newResponse) => {
  const { prompt, response } = newResponse;

  const mostRecentResponse = document.getElementsByClassName("response")[0];
  const newResponseContainer = mostRecentResponse.cloneNode(true);

  const newPromptText = newResponseContainer.querySelector("#prompt-text");
  const newResponseText = newResponseContainer.querySelector("#response-text");
  const newResponseLength =
    newResponseContainer.querySelector("#response-length");

  const newSaveButton = newResponseContainer.querySelector("#save-button");
  const newDeleteButton = newResponseContainer.querySelector("#delete-button");
  const tweetButton = newResponseContainer.querySelector("#tweet-button");
  newPromptText.innerHTML = prompt;
  newResponseLength.innerHTML = `(${response.length})`;
  newResponseText.innerHTML = response;

  newSaveButton.addEventListener("click", () => {
    handleSave(newResponse);
  });

  newDeleteButton.addEventListener("click", () => {
    if (responsesWrapper.children.length !== 1) {
      handleDelete(newResponse);
      newResponseContainer.remove();
    }
  });

  tweetButton.addEventListener("click", () => {
    handleTweet(newResponse);
  });

  responsesWrapper.insertBefore(newResponseContainer, mostRecentResponse);
  if (exampleResponse) {
    exampleResponse.remove();
  }
};

const fetchAPI = async (data) => {
  const Url = " https://api.openai.com/v1/engines/text-curie-001/completions";
  const response = await fetch(Url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(data),
  });

  return await response.json();
};

submitButton.addEventListener("click", handleSubmit);

loadTweetsButton.addEventListener("click", () => {
  handleLoadTweets();
  loadTweetsButton.classList.add("hidden");
});

promptInput.addEventListener("click", () => {
  if (promptInput.value === "") {
    promptInput.value = "Write me a tweet about ";
  }
});
