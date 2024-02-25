import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
    database: 'blog',
    host: "localhost",
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

const data = {
    async fetch(mode, options) {
        let result;
        try {
            switch (mode) {
                case list:
                    options = typeof options === 'object' ? options : { filter: options };
                    const queries = [
                        { type: 'show', query: "SELECT title, route, date, blerb FROM posts;" },
                        { type: 'filteredShow', query: "SELECT title, route, date, blerb FROM posts WHERE topic = $1;" },
                        { type: 'routes', query: "SELECT id, route FROM posts;" },
                        { type: 'admin', query: "SELECT id, title, route, date FROM posts;" }
                    ];
                    if (options.filter) {
                        result = await pool.query(queries[1].query, [options.filter]);
                    } else if (options.type) {
                        const setQuery = queries.find((query) => query.type === options.type);
                        result = await pool.query(setQuery.query);
                    } else {
                        result = await pool.query(queries[0].query);
                    }
                    break;
    
                case display:
                    options = typeof options === 'object' ? options : { id: options };
                    const columns = options.full ? "title, route, image, content, blerb, topic" : "title, date, image, content";
                    result = await pool.query(`SELECT $1 FROM posts WHERE id = $2`, [columns, options.id]);
                    break;
            }
            return { success: true, data: result.rows };
        } catch (e) {
            return { success: false, data: e.stack };
        }
    },

    async managePosts(action, data) {
        try {
            switch (action) {
                case create:
                    var [title, route, date, image, content, blerb, topic] = data;
                    await pool.query("INSERT INTO posts (title, route, date, image, content, blerb, topic) VALUES ($1, $2, $3, $4, $5, $6, $7);",
                    [title, route, date, image, content, blerb, topic]);
                break;

                case put:
                    var [id, title, route, image, content, blerb, topic] = data
                    await pool.query("UPDATE posts SET title = $2, route = $3, image = $4, content = $5, blerb = $6, topic= $7 WHERE id = $1",
                    [id, title, route, image, content, blerb, topic]);
                break;

                case drop:
                    await pool.query("DELETE FROM posts WHERE id = $1", [data]);
                break;
            }
            return {success: true, data: "operation successful"}
        } catch (e) {
            return {success: false, data: e.stack}
        }
    },
};

export default data;