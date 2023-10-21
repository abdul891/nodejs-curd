const { default: mongoose } = require("mongoose");

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  attachmentFile: {
    type: String,
    required:true
    
  },
  due_date: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
});
module.exports = mongoose.model("Tasks", taskSchema);
