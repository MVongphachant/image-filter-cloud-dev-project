import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util.js";

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// GET /filteredimage?image_url={{URL}}
app.get("/filteredimage", async (req, res) => {
  let { image_url } = req.query;

  // Validate the image_url query
  if (!image_url) {
    return res.status(400).send({ message: "image_url is required" });
  }

  try {
    // Call filterImageFromURL to filter the image
    const filteredPath = await filterImageFromURL(image_url);

    // Send the resulting file in the response
    res.sendFile(filteredPath, () => {
      // Delete the file after sending the response
      deleteLocalFiles([filteredPath]);
    });
  } catch (error) {
    res.status(422).send({
      message: "Unable to process the image at the provided URL.",
    });
  }
});

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
