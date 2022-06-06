require("dotenv").config();

const express = require("express");
var bodyParser = require("body-parser");
const axios = require("axios").default;

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile("/index.html");
});

app.post("/tweet", async (req, res) => {
  const userInput = req.body;
  try {
    const aiResponse = await fetchAPI(userInput);
    res.send(aiResponse);
  } catch (error) {
    console.log(error);
  }
});

const fetchAPI = async (body) => {
  const Url = " https://api.openai.com/v1/engines/text-curie-001/completions";
  try {
    const response = await axios.post(Url, JSON.stringify(body), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
