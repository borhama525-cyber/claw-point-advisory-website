migrate((app) => {
 const users = app.findCollectionByNameOrId('users');
 users.fields.add(new SelectField({name:'role',values:['member','admin'],maxSelect:1}));
 users.createRule = "@request.body.role:isset = false || @request.body.role = 'member'";
 users.updateRule = "(id = @request.auth.id && @request.body.role:changed = false) || @request.auth.role = 'admin'";
 app.save(users);
 for (const name of ['enquiries','contacts']) {
  const c = new Collection({name,type:'base',listRule:null,viewRule:null,createRule:'',updateRule:null,deleteRule:null,fields:[{name:'name',type:'text',max:200},{name:'email',type:'email',required:true},{name:'phone',type:'text',max:60},{name:'message',type:'text',max:5000},{name:'consent',type:'bool'},{name:'created',type:'autodate',onCreate:true},{name:'updated',type:'autodate',onCreate:true,onUpdate:true}]}); app.save(c);
 }
 app.save(new Collection({name:'chat_messages',type:'base',listRule:"@request.auth.id = owner || @request.auth.role = 'admin'",viewRule:"@request.auth.id = owner || @request.auth.role = 'admin'",createRule:"(@request.auth.id != '' && @request.body.owner = @request.auth.id && @request.body.sender = 'visitor') || @request.auth.role = 'admin'",updateRule:"@request.auth.role = 'admin'",deleteRule:null,fields:[{name:'owner',type:'relation',required:true,collectionId:users.id,maxSelect:1},{name:'sender',type:'select',values:['visitor','team'],required:true,maxSelect:1},{name:'message',type:'text',required:true,max:3000},{name:'created',type:'autodate',onCreate:true},{name:'updated',type:'autodate',onCreate:true,onUpdate:true}]}));
}, (app) => { for(const name of ['enquiries','contacts','chat_messages']) app.delete(app.findCollectionByNameOrId(name)); });
