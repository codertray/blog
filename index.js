import express, { Router }  from "express";
import fs from "fs";
import data from "./DB.js";
import bcrypt from "bcryptjs";
import env from "dotenv";
import session from "express-session";
import passport from "passport";
import local from "passport-local"
import multer from "multer"


const app = express();
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "./public/assets");
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    })
});
const port = 3000;
const config = env.config()

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true   
    })
);
app.use(passport.initialize());
app.use(passport.session())
app.use(async (req, res, next) => {
    const result = await data.fetch("list", {type: "routes"})
    !result.success && res.redirect("/blog/500");
    res.locals.postRoutes = result.data;
    next();
});


app.get("/blog", async (req, res) => {
    const result = await data.fetch("list");
    !result.success ? () => {
        res.redirect("/blog/500");
    } : res.render("../views/home.ejs", {data: result.data})
});

app.get("/blog/about", (req, res) => {
    res.render("../views/about.ejs");
});

app.get("/blog/404", (req, res) => {
    res.render("../views/404.ejs");
});

app.get("/blog/500", (req, res) => {
    res.render("../views/500.ejs");
});

app.get("/blog/admin", (req, res ) => {
    req.isAuthenticated() && res.redirect("/blog/admin/panel")
    res.render("../views/login.ejs");
});

app.post("/blog/login", passport.authenticate("local", {
    failureRedirect: "/blog/admin"
}), (req, res) => {
    res.redirect("/blog/admin/panel")
});

app.get("/blog/admin/panel", (req, res, next) => {
    req.isAuthenticated() ? checkPosts(req, res, next) : res.redirect("/blog/admin");
});
async function checkPosts(req, res, next) {
    try {
        const result = await data.fetch("list", {type: "admin"});
        if (!result.success) {
            console.log("Error:", result.data);
            res.redirect("/blog/500");
        } else {
            res.render("../views/panel.ejs", { data: result.data });
        }
    } catch (err) {
        console.error("Error:", err);
        res.redirect("/blog/500");
    }
}

app.get("/blog/admin/write", (req, res) => {
    res.render("../views/form.ejs");
});

app.get("/blog/admin/:post.edit", async (req, res) => {
    const post = req.params.post;
    const postRoutes = res.locals.postRoutes
    let foundPost = postRoutes.find((postRoute) => (postRoute.route === post));
    const result = await data.fetch("display", {full: true, id: foundPost.id});
    !result.success ? () => {
        res.redirect("/blog/404");
        console.log(result.data);
    } : res.render("../views/form.ejs", {id: foundPost.id, data: result.data[0] });
});

app.post("/blog/admin/delete", async (req, res) => {
    const postid = req.body.id;
    const path = req.body.path
    try {
        const result = await data.managePosts("drop", postid);
        if (!result.success) {
            console.error("Error deleting post:", result.data);
            res.redirect("/blog/500");
        } else {
            if (path !== null) {
                fs.unlink(path, (err) => {
                    err ? console.error("error deleting file")
                    : console.log("success")
                })
            }
            res.redirect("/blog/admin/panel");
        }
    } catch (err) {
        console.error("Error:", err);
        res.redirect("/blog/500");
    }
});

app.post("/blog/admin/post", upload.single("image"), async (req, res) => {
    const { title, route, content, blerb, topic } = req.body;
    const date = new Date().toLocaleDateString("en-us");
    const imagePath = req.file ? req.file.path : null
    const result = await data.managePosts("create", [title, route, date, imagePath, content, blerb, topic]);
        if (!result.success) {
            console.error("Error adding post:", result.data);
            res.redirect("back");
        } else {
            res.redirect("/blog/admin/panel");
            }
});

app.post("/blog/admin/update", upload.single("image"), async (req, res) => {
    const { id, title, route, oldPath, content, blerb, topic } = req.body;
    const imagePath = req.file ? req.file.path : oldPath || null;
    if(oldPath && oldPath !== imagePath) {
        fs.unlink(oldPath, (err) => {
            err ? () =>{
                console.log("error removing file", err);
            } : console.log("success")
        });
    }
    const result = await data.managePosts("put", [id, title, route, imagePath, content, blerb, topic])
    !result.success ? res.redirect("back")
    : res.redirect("/blog/admin/panel")
});

app.get("/blog/:topic-posts", async (req, res) => {
    const topic = req.params.topic;
    const result = await data.fetch("list", topic);
    !result.success ? () => {
        res.redirect("/blog/500");
        console.log(result.data)
    } : res.render("../views/filter.ejs", {topic: topic, data: result.data});
});

app.get("/blog/:post", async (req, res) => {
    const post = req.params.post;
    const postRoutes = res.locals.postRoutes;
    const foundPost = postRoutes.find(postRoute => postRoute.route === post);  
    if (foundPost) {
        const result = await data.fetch("display", foundPost.id);
        if (!result.success) {
            console.error("Error displaying post:", result.data);
            res.redirect("/blog/500");
        } else {
            console.log(result)
            res.render("../views/post.ejs", { data: result.data[0] });
        }
    } else {
        res.redirect("/blog/404");
    }
});

passport.use(new local.Strategy(async function verify(id, password, done) {
    try {
        const hash = process.env.PASSWORD;
        if(id !== process.env.ADMIN_ID) {
            console.log("wrong id")
            return done(null, false);
        } else {
            const result = await bcrypt.compare(password, hash);
            if (result) {
                console.log("success");
                return done(null, { id: process.env.ADMIN_ID, password: password });
            } else {
                console.log("wrong password");
                return done(null, false);
            }
        }
    } catch (err) {
        console.error("Error:", err);
        return done(err);
    }
}));
  

passport.serializeUser(function(admin, cb) {
    cb(null, admin);
});

passport.deserializeUser(function(admin, cb) {
    cb(null, admin);
});

app.listen(port, () => {
    console.log(`server listening on port ${port}`)
})

