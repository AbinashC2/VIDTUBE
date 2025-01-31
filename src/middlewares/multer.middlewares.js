import multer from "multer";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // todo: for Users
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

    // Extract the file extension from the original name
    const fileExtension = file.originalname.split(".").pop();
    // Create a new file name
    const newFileName = `user-file-${Date.now()}.${fileExtension}`;
    cb(null, newFileName); // Assign the new file name
  },
});

export const upload = multer({
    storage
})