const mediaModel = require("../models/media");
require("dotenv").config();

const GetFilms = async (req, res) => {
  const { searchTerm } = req?.params;
  if (!searchTerm) return res.status(400).json({ Alert: "No Search Term!" });

  const data = await mediaModel.findOne({ title: searchTerm });
  if (!data) {
    res.status(400).json({ Alert: "No Film Found!" });
  } else {
    res.status(200).json(data);
  }
};

async function SearchByTitle(req, res) {
  const { searchTerm } = req?.body;
  if (!searchTerm) {
    return res.status(400).json({ Alert: "Search term not provided" });
  }

  try {
    const matches = await mediaModel.find({ title: { $regex: searchTerm, $options: 'i' } });

    if (matches.length === 0) {
      return res.status(404).json({ Alert: "No matching films found" });
    } else {
      res.status(200).json(matches);
    }
  } catch (error) {
    console.error("Error searching by title:", error);
    res.status(500).json({ Alert: "Internal Server Error" });
  }
}


async function IDWise(req, res) {
  const id = req?.params?.id;
  if (!id) return res.status(400).json({ Alert: "No ID Provided" });
  const foundByID = await mediaModel.findOne({ _id: String(id) });

  if (!foundByID) {
    return res.status(404).json({ Alert: "Film doesn't exist" });
  } else {
    return res.status(200).json(foundByID);
  }
}



async function DeleteItems(req, res) {
  try {
    const id = req?.params?.id;
    const filmExists = await mediaModel.findOne({ _id: String(id) });
    if (!filmExists) {
      return res.status(404).json({ Alert: "Film doesn't exist" });
    } else {
      await mediaModel.deleteOne({ _id: String(id) });
      return res.status(200).json({ Alert: "Film Deleted" });
    }
  } catch (err) {
    console.error(err);
  }
}

async function UpdateFilm(req, res) {
  try {
    const id = req?.params?.id;
    const title = req?.body?.title;
  
    const filmExists = await mediaModel.findById(id); 
    if (!filmExists) {
      return res.status(404).json({ Alert: "Film doesn't exist" });
    }else{
      await filmExists.updateOne({title})
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ Alert: "Internal Server Error" });
  }
}

async function Upvote(req,res){
  const id = req?.params?.id;
  if(!id) res.status(400).json({Alert:"Please send the ID"})
  try{
    const data = await mediaModel.findById(id)
    if(!data){
      res.status(404).json({Alert:"Invalid ID"})
    }else{
      await data.updateOne({$inc:{rating:1}})
    }
  }catch(err){
    console.error(err);
  }
}

module.exports = { SearchByTitle, DeleteItems, UpdateFilm, IDWise, GetFilms,Upvote };
