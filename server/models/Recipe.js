const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: "this field is required",
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  ingredients: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    enum: ["Thai", "American", "Chinese", "Mexican", "Indian", "Spanish"],
    required: true,
  },
});
// Indexing
// recipeSchema.index({ name: "text", description: "text" });
//Wild Card Indexing
recipeSchema.index({ "$**": "text" });

module.exports = mongoose.model("Recipe", recipeSchema);
