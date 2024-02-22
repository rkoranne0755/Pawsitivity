import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const dogParentSchema = new mongoose.Schema({
  userType: {
    type: String,
    default: "DogParent",
  },
  username: {
    type: String,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  houseNo: {
    type: String,
  },
  street: String,
  colony: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: String,
  dogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dogs",
    },
  ],
  displayPicture: {
    type: String,
    default: "",
  },
  contactNo: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Check if mobileNumber is exactly 10 digits
        return /^\d{10}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid 10-digit mobile number!`,
    },
  },
  refreshToken: {
    type: String,
  },
});

dogParentSchema.plugin(mongooseAggregatePaginate);

dogParentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 4);
  next();
});

dogParentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

dogParentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

dogParentSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const DogParent = mongoose.model("DogParent", dogParentSchema);
export { DogParent };
