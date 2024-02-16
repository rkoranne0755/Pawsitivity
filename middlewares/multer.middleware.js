import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    // console.log('reqwesr',file)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    req.body.displayPicture = file.fieldname + '-' + uniqueSuffix;
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const uploads = multer({ storage: storage })

export default uploads;










// const uploads = multer({ dest: './public/temp/' })
// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, "/public/temp");
// //   },
// //   filename: function (req, file, cb) {
// //     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
// //     cb(null, file.fieldname + "-" + uniqueSuffix);
// //   },
// // });

// // exports  = uploads;

// // export const uploads = multer({
// //   storage,
// // });

// export default uploads