//API key hopefully will go undetected, ideally would be stored in an environment variable
//With no backend and vanilla javascript this was the best solution I could find:
OPENAI_API_KEY = "sk-9iTykVyyk2ySOg3f4pX1T3" + "BlbkFJJnZXDWWanttEQH7YuEjr";

const promptInput = document.getElementById("prompt");
const submitButton = document.getElementById("submit-button");
const loadTweetsButton = document.getElementById("load-tweets-button");
const tweetsWrapper = document.getElementById("tweets-wrapper");
const exampleTweet = document.getElementsByClassName("tweet")[0];

let TWEETS = []; //tweets state
let tweetCookie = "";
const cookieName = "tweets=";

const checkIfCookieExists = () => {
  let cookiesArray = document.cookie.split(";");
  let tweetCookie;
  cookiesArray.forEach((cookie) => {
    if (cookie.trim().startsWith(cookieName)) {
      tweetCookie = cookie.trim().substring(cookieName.length);
    }
  });
  return tweetCookie;
};

//if there are previously saved tweets in the browser will update state and allow load
if (checkIfCookieExists()) {
  TWEETS = JSON.parse(checkIfCookieExists());
  if (TWEETS.length > 0) {
    loadTweetsButton.classList.remove("hidden");
  }
}

console.log(TWEETS);

//HANDLERS

const handleSubmit = async () => {
  const prompt = promptInput.value;
  if (prompt !== "") {
    const newTweet = await arrangeDataIntoTweetObject(prompt);
    loadNewTweet(newTweet);
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

const handleSave = (tweet) => {
  const tweetExists = TWEETS.find(({ id }) => id === tweet.id);
  if (!tweetExists) {
    TWEETS.unshift(tweet);
    document.cookie = `${cookieName}${JSON.stringify(TWEETS)}`;
    console.log("saved");
  } else {
    console.log("tweet exists");
  }
};

const handleDelete = (tweet) => {
  const filteredTweets = TWEETS.filter(({ id }) => id !== tweet.id);
  TWEETS = [...filteredTweets];
  document.cookie = `${cookieName}${JSON.stringify(TWEETS)}`;
  console.log("deleted");
};

const handleLoadTweets = () => {
  TWEETS.forEach((tweet) => {
    loadNewTweet(tweet);
  });
};

//

const arrangeDataIntoTweetObject = async (prompt) => {
  const data = {
    prompt: prompt,
    temperature: 0.5,
    max_tokens: 60, //should average 240 characters
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

  const tweetObject = {
    id: Math.floor(Math.random() * 100000000),
    prompt: prompt,
    tweet: text,
  };

  return tweetObject;
};

const fetchAPI = async (data) => {
  const Url = " https://api.openai.com/v1/engines/text-curie-001/completions";
  const tweet = await fetch(Url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(data),
  });

  return await tweet.json();
};

const loadNewTweet = (newTweet) => {
  const { prompt, tweet } = newTweet;

  const mostRecentTweet = document.getElementsByClassName("tweet")[0];
  const newTweetContainer = mostRecentTweet.cloneNode(true);

  const newPromptText = newTweetContainer.querySelector("#prompt-text");
  const newTweetText = newTweetContainer.querySelector("#tweet-text");
  const newTweetLength = newTweetContainer.querySelector("#tweet-length");

  const newSaveButton = newTweetContainer.querySelector("#save-button");
  const newDeleteButton = newTweetContainer.querySelector("#delete-button");
  const tweetButton = newTweetContainer.querySelector("#tweet-button");

  //set content
  newPromptText.innerHTML = prompt;
  newTweetLength.innerHTML = `(${tweet.length})`;
  newTweetText.innerHTML = tweet;

  //add functionality
  newSaveButton.addEventListener("click", () => {
    handleSave(newTweet);
    newTweetContainer.classList.add("save");
    setTimeout(() => {
      newTweetContainer.classList.remove("popin");
      newTweetContainer.classList.remove("save");
    }, 500);
  });

  newDeleteButton.addEventListener("click", () => {
    handleDelete(newTweet);
    newTweetContainer.classList.add("delete");
    setTimeout(() => {
      console.log(tweetsWrapper.children.length);
      if (tweetsWrapper.children.length === 2) {
        exampleTweet.classList.remove("hidden");
      }
      newTweetContainer.remove();
    }, 500);
  });

  tweetButton.addEventListener("click", () => {
    handleTweet(newTweet);
  });

  //add to DOM
  tweetsWrapper.insertBefore(newTweetContainer, mostRecentTweet);
  if (exampleTweet) {
    exampleTweet.classList.add("hidden");
  }
};

//event listeners

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
