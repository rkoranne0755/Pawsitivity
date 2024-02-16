import mongoose from "mongoose";

const dogSchema = new mongoose.Schema({
  dogName: {
    type: String,
    required: true,
  },
  dogBreed: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DogParent",
  },
  disease: {
    type: String,
    default: false,
  },
  allergies: [
    {
      type: String,
    },
  ],
  gender: {
    type: String,
    required: true,
  },
  displayPicture: {
    type: String,
    required: true,
  },
});

export const Dogs = mongoose.model("Dogs", dogSchema);
