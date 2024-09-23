const express = require("express");
const app = express();
const cors = require("cors");
const { dbOperation, con } = require("./db");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post("/create", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .send({ message: "Title and description are required" });
    }
    const result = await dbOperation(con, { title, description }, "create");
    return res
      .status(201)
      .send({ message: "Created successfully", data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

app.get("/", async (req, res) => {
  try {
    const data = await dbOperation(con, {}, "get");
    return res.status(200).send({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/delete", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({ message: "Id is required" });
    }
    const result = await dbOperation(con, { id }, "delete");
    if (!result) {
      return res.status(404).send({ message: "Item not found" });
    }
    return res.status(200).send({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: "Invalid id format" });
    }

    if (!title && !description) {
      return res.status(400).json({
        message:
          "At least one field (title or description) is required for update",
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    const result = await dbOperation(
      con,
      { id: parsedId, ...updateData },
      "update"
    );

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item updated successfully",
      updatedId: parsedId,
      updatedFields: updateData,
    });
  } catch (err) {
    console.error("Edit operation error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
