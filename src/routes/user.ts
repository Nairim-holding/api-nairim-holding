import express from "express";

const router = express.Router();

router.get("/users", (req, res) => {
  res.send("Rota dos usuarios");
});

export default router;
