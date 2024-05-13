import mongoose from 'mongoose';

export const accessSchema = new mongoose.Schema({
  access: {
    user: {
      can_login: [mongoose.SchemaTypes.ObjectId],
      can_purchase_resources: [mongoose.SchemaTypes.ObjectId],
      can_subscribe_to_resources: [mongoose.SchemaTypes.ObjectId],
    },
    subAdmin: {
      can_penalize_users: [mongoose.SchemaTypes.ObjectId],
      can_ban_users: [mongoose.SchemaTypes.ObjectId],
      can_create_other_subadmins: [mongoose.SchemaTypes.ObjectId],
      can_remove_other_subadmins: [mongoose.SchemaTypes.ObjectId],
      can_create_admin_content: [mongoose.SchemaTypes.ObjectId],
      can_edit_admin_content: [mongoose.SchemaTypes.ObjectId],
      can_delete_admin_content: [mongoose.SchemaTypes.ObjectId],
      can_monify_admin_content: [mongoose.SchemaTypes.ObjectId],
      can_unmonify_admin_content: [mongoose.SchemaTypes.ObjectId],
    },
  },
});
