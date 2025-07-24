import fs from "fs";
import Jimp from "jimp";

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL) {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate URL format
      if (!inputURL || typeof inputURL !== "string") {
        throw new Error("Invalid URL provided");
      }

      // Validate URL protocol
      try {
        const url = new URL(inputURL);
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("URL must use http or https protocol");
        }
      } catch (e) {
        throw new Error("Invalid URL format");
      }

      // Download the image using fetch
      const response = await fetch(inputURL, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ImageFilter/1.0)",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error(
          `URL does not point to an image. Content-Type: ${contentType}`
        );
      }

      // Get the image as a buffer
      const imageBuffer = await response.arrayBuffer();

      if (imageBuffer.byteLength === 0) {
        throw new Error("Received empty image data");
      }

      // Process with Jimp using the buffer
      const photo = await Jimp.read(Buffer.from(imageBuffer));

      const outpath =
        "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";

      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(outpath, (img) => {
          resolve(outpath);
        });
    } catch (error) {
      reject(error);
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files) {
  for (let file of files) {
    try {
      fs.unlinkSync(file);
    } catch (error) {
      // Silently ignore deletion errors
    }
  }
}
