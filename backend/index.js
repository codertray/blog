import express, { Router }  from "express"
import fs from "fs"
import data from "./DB.js"
import bcrypt from "bcryptjs"
import env from "dotenv"
import session from "express-session";
import passport from "passport";
import local from "passport-local"
import multer from "multer"


const app = express();
const upload = multer({dest: "../public/assets"})
const port = 3000;

env.config({
    path: "../.env"
})

app.use(express.static("../public"));
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
    const result = await data.getRoutes()
    !result.success && res.redirect("/blog/500");
    res.locals.postRoutes = result.data;
    next();
});

app.get("/blog", async (req, res) => {
    const result = await data.getPosts();
    !result.success ? () => {
        res.redirect("/blog/500");
        console.log(result.data);
    } : res.render("../views/home.ejs", {data: result.data})
});

app.get("/blog/about", (req, res) => {
    res.render("../views/about.ejs");
});

app.get("/blog/404", (req, res) => {
    res.render("../views/404.ejs");
});

app.get("/blog/500", (req, res) => {
    res.render("../views/500");
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
        const result = await data.listPosts();
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
    post = req.params.post;
    const postRoutes = res.locals.postRoutes
    foundPost = postRoutes.find((postRoute) => (postRoute === post));
    const result = await data.displayPost(foundPost.id);
    !result.success ? () => {
        res.redirect("/blog/404");
        console.log(result.data);
    } : res.render("../views/form.ejs", {data: result.data});
});

app.post("/blog/admin/delete", async (req, res) => {
    const postid = req.body.id;
    try {
        const result = await data.deletePost(postid);
        if (!result.success) {
            console.error("Error deleting post:", result.data);
            res.redirect("/blog/500");
        } else {
            fs.unlink(result.data.path, (err) => {
                err ? console.error("error deleting file")
                : console.log("success")
            })
            res.redirect("/blog/admin/panel");
        }
    } catch (err) {
        console.error("Error:", err);
        res.redirect("/blog/500");
    }
});

app.post("/blog/admin/post", upload.single("image"), async (req, res) => {
    const { title, image, content, blerb, route } = req.body;
    const date = new Date().toISOString(); // Use ISO string for date
    const imagePath = req.file.path;
    const result = await data.addPost(title, route, date, imagePath, content, blerb);
        if (!result.success) {
            console.error("Error adding post:", result.data);
            res.redirect("back");
        } else {
            res.redirect("/blog/admin/panel");
            }
});

app.post("/blog/admin/update", upload.single("image"), async (req, res) => {
    const { id, title, route, oldPath, content, blerb } = req.body;
    const imagePath = req.file.path;
    if(oldPath || oldPath !== imagePath) {
        fs.unlink(oldPath, (err) => {
            err ? () =>{
                console.log("error removing file", err);
            } : console.log("success")
        });
    }
    const result = data.updatePost(id, title, route, imagePath, content, blerb, topic)
    !result.success ? res.redirect("back")
    : res.redirect("/blog/admin/panel")
});

app.get("/blog/:topic-posts", async (req, res) => {
    const topic = req.params.topic;
    const result = await data.filterTopic(topic);
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
        const result = await data.displayPost(foundPost.id);
        if (!result.success) {
            console.error("Error displaying post:", result.data);
            res.redirect("/blog/500");
        } else {
            res.render("../views/post.ejs", { data: result.data });
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

