import pg from "pg";
import dotenv from "dotenv";

dotenv.config({
    path: "../.env"
});

const pool = new pg.Pool({
    database: 'blog',
    host: "localhost",
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

const data = {
    async getRoutes() {
        try {
            const result = await pool.query("SELECT id, route FROM posts;");
            return {
                success: true,
                data: result.rows,
            };
        } catch (e) {
            return {
                success: false,
                data: e.stack
            };
        }
    },

    async getPosts() {
        try {
            const result = await pool.query("SELECT title, route, date, blerb FROM posts;");
            return {
                success: true,
                data: result.rows
            };
        } catch (e) {
            return {
                success: false,
                data: e.stack
            };
        }
    },

    async listPosts() {
        try {
            const result = await pool.query("SELECT id, title, route, date FROM posts;");
            return {
                success: true,
                data: result.rows
            };
        } catch (e) {
            return {
                success: false,
                data: e.stack
            };
        }
    },


    async filterTopic(topic) {
        try {
            const result = await pool.query("SELECT title, route, date, blerb FROM posts WHERE topic = $1", [topic]);
            return {
                success: true,
                data: result.rows
            };
        } catch (e) {
            return {
                success: false,
                data: e.stack
            };
        }
    },

    async displayPost(id) {
        try {
            const result = await pool.query("SELECT title, image, content FROM posts WHERE id = $1;", [id]);
            return {
                success: true,
                data: result.rows[0]
            };
        } catch (e) {
            return {
                success: false,
                data: e.stack
            };
        }
    },

    async addPost(title, route, date, image, content, blerb, topic) {
        try {
            await pool.query("INSERT INTO posts (title, route, date, image, content, blerb) VALUES ($1, $2, $3, $4, $5, $6);",
            [title, route, date, image, content, blerb, topic]);
            return {
                success: true,
                data: "query returned successfully",
            };
        } catch (e) {
            return {
                success: false,
                data: `an error has occurred. ${e.stack}`,
            };
        }
    },

    async updatePost(id, title, route, image, content, blerb, topic) {
        try {
            await pool.query("UPDATE posts SET title = $2, route = $3, image = $4, content = $5, blerb = $6, topic= $7 WHERE id = $1",
            [id, title, route, image, content, blerb, topic]);
            return {
                success: true,
                data: "query returned successfully",
            };
        } catch (e) {
            return {
                success: false,
                data: `an error has occurred. ${e.stack}`,
            };
        }
    },

    async deletePost(id) {
        try {
            imagePath = await pool.query("SELECT image FROM posts WHERE id = $1;", [id])
            await pool.query("DELETE FROM posts WHERE id = $1", [id]);
            return {
                success: true,
                data:  {message: "query returned succesfully", path: imagePath},
            };
        } catch (e) {
            return {
                success: false,
                data: `an error has occurred. ${e.stack}`,
            };
        }
    }
};

export default data;