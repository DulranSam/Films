const express = require("express");
const router = express.Router();
const FilmMainController = require("../controllers/FilmMains");
const Search = require("../controllers/SearchTitle");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage: storage });


router
  .route("/")
  .get(FilmMainController.GetFilms)
  .post(upload.single("image"), FilmMainController.CreateFilms);


router.route("/search").post(Search.SearchByTitle);
router
  .route("/:id")
  .post(Search.IDWise)
  .delete(Search.DeleteItems)
  .put(Search.UpdateFilm)
  .patch(Search.Upvote);
  router.route("/comment/:id").put(Search.addComments)
  router.route("/downvote/:id").put(Search.Downvote)


router.route("/:searchTerm").get(Search.SearchByTitle);

module.exports = router;
