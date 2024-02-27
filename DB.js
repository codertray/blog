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
    /**
 * Fetches data from the database based on the specified mode and options.
 * 
 * @param {string} mode - The mode of operation for fetching data (e.g., "list", "display").
 * @param {Object} options - Additional options for the fetch operation. The structure of this parameter varies depending on the mode.
 *                           For "list" mode:
 *                             - filter: {string} filters posts by topic
 *                             - type: {string} adjusts the query based on the needed data if no type is given the view query is used
 *                             - if an object is not given as options filter is assumed
 *                           For "display" mode:
 *                             - full: {boolean} determines if a full record is to be fetched.
 *                             - id: {number} REQUIRED the id of the post to be shown.
 *                             - if an object isn't given as options id is assumed
 * @returns {Object} An object containing the success status and the fetched data.
 *                   - success (boolean): Indicates whether the operation was successful.
 *                   - data (Array): An array of objects representing the fetched data. Each object contains the retrieved fields from the database.
 */
    async fetch(mode, options) {
        let result;
        try {
            switch (mode) {
                case "list":
                    options = typeof options === 'object' ? options : { filter: options };
                    const queries = [
                        { type: 'show', query: "SELECT title, route, date, blerb FROM posts;" },
                        { type: 'filteredShow', query: "SELECT title, route, date, blerb FROM posts WHERE topic = $1;" },
                        { type: 'routes', query: "SELECT id, route FROM posts;" },
                        { type: 'admin', query: "SELECT id, title, route, date, image FROM posts;" }
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
    
                case "display":
                    options = typeof options === 'object' ? options : { id: options };
                    const columns = options.full ? "title, route, image, content, blerb, topic" : "title, date, image, content";
                    const query = `SELECT ${columns} FROM posts WHERE id = $1`;
                    result = await pool.query(query, [options.id]);                    
                    break;
            }
            return { success: true, data: result.rows };
        } catch (e) {
            return { success: false, data: e.stack };
        }
    },

    /**
 * Manages posts in the database based on the specified action and data.
 * 
 * @param {string} action - The action to perform on the posts (e.g., "create", "put", "drop").
 * @param {Array|number} data - Data required for the specified action. The structure of this parameter varies depending on the action:
 *                       - For "create" action: An array containing [title, route, date, image, content, blerb, topic].
 *                       - For "put" action: An array containing [id, title, route, image, content, blerb, topic].
 *                       - For "drop" action: the ID of the post to be deleted.
 * @returns {Object} An object containing the success status and any relevant data related to the operation.
 *                   - success (boolean): Indicates whether the operation was successful.
 *                   - data (string): Contains additional information about the operation (e.g., "operation successful").
 */
    async managePosts(action, data) {
        let path = null;
        try {
            switch (action) {
                case "create":
                    var [title, route, date, image, content, blerb, topic] = data;
                    await pool.query("INSERT INTO posts (title, route, date, image, content, blerb, topic) VALUES ($1, $2, $3, $4, $5, $6, $7);",
                    [title, route, date, image, content, blerb, topic]);
                break;

                case "put":
                    var [id, title, route, image, content, blerb, topic] = data
                    await pool.query("UPDATE posts SET title = $2, route = $3, image = $4, content = $5, blerb = $6, topic= $7 WHERE id = $1",
                    [id, title, route, image, content, blerb, topic]);
                break;

                case "drop":
                    await pool.query("DELETE FROM posts WHERE id = $1", [data]);
                break;
            }
            return {success: true, data: "query returned successful"}
        } catch (e) {
            return {success: false, data: e.stack}
        }
    },
};

export default data;