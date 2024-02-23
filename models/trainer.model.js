import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt";

const trainerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    // required: true,
  },
  trainingCenterName: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
    // required: true,
  },
  dateOfBirth: {
    type: Date,
    // required: true,
  },
  gender: {
    type: String,
    // required: true,
  },
  qualification: [
    {
      type: String,
    },
  ],
  houseNo: {
    type: String,
  },
  street: String,
  colony: {
    type: String,
    // required: true,
  },
  city: {
    type: String,
    // required: true,
  },
  state: String,
  displayPicture: {
    type: String,
    // required: true,
  },
  contactNo: {
    type: String,
    // required: true,
    // validate: {
    //   validator: function (v) {
    //     // Check if mobileNumber is exactly 10 digits
    //     return /^\d{10}$/.test(v);
    //   },
    //   message: (props) =>
    //     `${props.value} is not a valid 10-digit mobile number!`,
    // },
  },
});

trainerSchema.plugin(mongooseAggregatePaginate);

trainerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 4);
  next();
});

trainerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const Trainer = mongoose.model("Trainer", trainerSchema);
