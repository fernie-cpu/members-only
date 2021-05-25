let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PostSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: String, required: true },
});

PostSchema.virtual('url').get(function () {
  return '/' + this._id;
});

module.exports = mongoose.model('Post', PostSchema);
