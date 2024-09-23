const mysql = require("mysql2/promise");

try {
  const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db",
  });

  (async () => {
    try {
      const connection = await con;
      const tableName = "tasks";

      const [rows] = await connection.query(
        `
        SELECT COUNT(*) AS tableExists
        FROM information_schema.tables 
        WHERE table_schema = ? 
        AND table_name = ?;
      `,
        [connection.config.database, tableName]
      );

      if (rows[0].tableExists === 0) {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log(`Table '${tableName}' created successfully.`);
      } else {
        console.log(`Table '${tableName}' already exists.`);
      }
    } catch (err) {
      console.error("Database initialization error:", err);
    }
  })();

  const dbOperation = async (connection, data, operation) => {
    try {
      let query;
      let values;
      switch (operation) {
        case "create":
          query = "INSERT INTO tasks (title, description) VALUES (?, ?)";
          values = [data.title, data.description];
          break;
        case "delete":
          query = "DELETE FROM tasks WHERE id = ?";
          values = [data.id];
          break;
        case "get":
          query = "SELECT * FROM tasks";
          values = [];
          break;
        case "edit":
          query = "UPDATE tasks SET title = ?, description = ? WHERE id = ?";
          values = [data.title, data.description, data.id];
          break;
        default:
          throw new Error("Invalid operation");
      }

      const [result] = await connection.query(query, values);
      return result;
    } catch (err) {
      console.error("Database operation error:", err);
      throw err;
    }
  };

  module.exports = { dbOperation, con };
} catch (err) {
  throw err;
}
