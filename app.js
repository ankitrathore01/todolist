//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { compile } = require("ejs");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ankit:ankit9782@cluster0.gvta2.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);


const item1 = new Item({
  name:"welcome to your todolist"
});

const item2 = new Item({
  name:"Hit the add button"
});

const item3 = new Item({
  name:"Hit the checkbox"
});

const defaultItems = [item1,item2,item3];

app.get("/", function(req, res) {
  Item.find({},function(err,result){
    if(result.length === 0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log("error occured due to some reasons");
        }
        else
        {
          console.log("succesfully added");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  });
});

app.post("/", function(req, res){

  const newone = req.body.newItem;

  const listname = req.body.list;

  const item = new Item({
    name:newone
  });

  if(listname === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else{   
    List.findOne({name: listname}, function(err,result){
      result.items.push(item);
      result.save();
      res.redirect("/" + listname);
    });
  }
});

app.post("/delete", function(req, res){
  const itemIdChecked = req.body.Checkbox;
  const listname = req.body.listname;

  if(listname === "Today")
  {
    Item.findByIdAndRemove( itemIdChecked, function(err){
      if(err){
        console.log("error occured");
      }
      else{
        console.log("succesfully deleted");
        res.redirect("/");
      }  
    });
  }
  else{
    List.findOneAndUpdate({name: listname}, {$pull: {items: {_id: itemIdChecked } } }, function(err,result){
      if(err){
        console.log("error occured");
      }
      else{
        res.redirect("/" + listname);
      }
    });
  }  
});

const listSchema = {
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/:customListName", function(req,res){

  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName},function(err,result){
    if(!err){
      if(!result)
      {
        const list  = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName); 
      }
      else{
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
  }); 
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
