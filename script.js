console.log("hello world");
console.log(document.cookie);
//console.log(process.env.OPENAI_API_KEY);

OPENAI_API_KEY = "sk-9iTykVyyk2ySOg3f4pX1T3" + "BlbkFJJnZXDWWanttEQH7YuEjr";

const promptInput = document.getElementById("prompt");
const submitButton = document.getElementById("submit-button");
const responsesWrapper = document.getElementById("responses-wrapper");
const exampleResponse = document.getElementsByClassName("response")[0];

const responses = [];

const handleSubmit = async () => {
  const prompt = promptInput.value;
  if (prompt !== "") {
    const newResponse = await arrangeDataIntoResponseObject(prompt);
    responses.unshift(newResponse);
    loadNewResponse(newResponse);
    document.cookie = `responses=${responses}`;
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
    prompt: prompt,
    response: text,
  };

  return responseObject;
};

const loadNewResponse = (newResponse) => {
  const { prompt, response } = newResponse;
  const mostRecentResponse = document.getElementsByClassName("response")[0];
  const newResponseContainer = mostRecentResponse.cloneNode(true);
  newResponseContainer.children[1].innerHTML = prompt;
  newResponseContainer.children[3].innerHTML = `(${response.length})`;
  newResponseContainer.children[4].innerHTML = response;
  const tweetButton = newResponseContainer.children[5];
  tweetButton.addEventListener("click", handleTweet);
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
promptInput.addEventListener("click", () => {
  if (promptInput.value === "") {
    promptInput.value = "Write me a tweet about ";
  }
});
